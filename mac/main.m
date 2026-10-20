#import <Cocoa/Cocoa.h>
#include <arpa/inet.h>
#include <errno.h>
#include <fcntl.h>
#include <netinet/in.h>
#include <signal.h>
#include <string.h>
#include <sys/socket.h>
#include <unistd.h>

static NSTask *serverTask = nil;
static BOOL terminating = NO;

static NSString *runtimeDir(void) {
    const char *tmp = getenv("TMPDIR");
    if (tmp != NULL && tmp[0] != '\0') {
        return [NSString stringWithUTF8String:tmp];
    }
    return @"/tmp";
}

static NSString *portFile(void) {
    return [runtimeDir() stringByAppendingPathComponent:@"free-throw-frenzy.port"];
}

static NSString *pidFile(void) {
    return [runtimeDir() stringByAppendingPathComponent:@"free-throw-frenzy.pid"];
}

static BOOL pidAlive(pid_t pid) {
    return pid > 0 && kill(pid, 0) == 0;
}

static int claimPort(void) {
    for (int port = 4173; port <= 4190; port++) {
        int fd = socket(AF_INET, SOCK_STREAM, 0);
        if (fd < 0) continue;
        int yes = 1;
        setsockopt(fd, SOL_SOCKET, SO_REUSEADDR, &yes, sizeof(yes));
        struct sockaddr_in addr;
        memset(&addr, 0, sizeof(addr));
        addr.sin_family = AF_INET;
        addr.sin_port = htons((uint16_t)port);
        addr.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
        int bound = bind(fd, (struct sockaddr *)&addr, sizeof(addr));
        close(fd);
        if (bound == 0) return port;
    }
    return -1;
}

static BOOL portAccepts(int port) {
    int fd = socket(AF_INET, SOCK_STREAM, 0);
    if (fd < 0) return NO;
    struct timeval tv;
    tv.tv_sec = 0;
    tv.tv_usec = 200000;
    setsockopt(fd, SOL_SOCKET, SO_SNDTIMEO, &tv, sizeof(tv));
    setsockopt(fd, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));
    struct sockaddr_in addr;
    memset(&addr, 0, sizeof(addr));
    addr.sin_family = AF_INET;
    addr.sin_port = htons((uint16_t)port);
    inet_pton(AF_INET, "127.0.0.1", &addr.sin_addr);
    int result = connect(fd, (struct sockaddr *)&addr, sizeof(addr));
    close(fd);
    return result == 0;
}

static void showAlert(NSString *message) {
    dispatch_async(dispatch_get_main_queue(), ^{
        NSAlert *alert = [[NSAlert alloc] init];
        alert.messageText = @"Free Throw Frenzy";
        alert.informativeText = message;
        [alert runModal];
        [NSApp terminate:nil];
    });
}

@interface AppDelegate : NSObject <NSApplicationDelegate>
@end

@implementation AppDelegate

- (void)applicationDidFinishLaunching:(NSNotification *)notification {
    dispatch_async(dispatch_get_global_queue(QOS_CLASS_USER_INITIATED, 0), ^{
        [self openGame];
    });
}

- (void)openGame {
    NSString *existingPort = [NSString stringWithContentsOfFile:portFile() encoding:NSUTF8StringEncoding error:nil];
    NSString *existingPid = [NSString stringWithContentsOfFile:pidFile() encoding:NSUTF8StringEncoding error:nil];
    pid_t oldPid = (pid_t)existingPid.intValue;
    if (existingPort.length > 0 && pidAlive(oldPid) && oldPid != getpid()) {
        NSString *urlString = [NSString stringWithFormat:@"http://127.0.0.1:%d/", existingPort.intValue];
        dispatch_async(dispatch_get_main_queue(), ^{
            [[NSWorkspace sharedWorkspace] openURL:[NSURL URLWithString:urlString]];
            [NSApp terminate:nil];
        });
        return;
    }

    NSString *gameDir = [[[NSBundle mainBundle] resourcePath] stringByAppendingPathComponent:@"game"];
    NSString *indexPath = [gameDir stringByAppendingPathComponent:@"index.html"];
    if (![[NSFileManager defaultManager] fileExistsAtPath:indexPath]) {
        showAlert(@"The game files are missing from the app.");
        return;
    }

    int port = claimPort();
    if (port < 0) {
        showAlert(@"No free port was available to start the game.");
        return;
    }

    NSString *serverScript = [[[NSBundle mainBundle] resourcePath] stringByAppendingPathComponent:@"session_server.py"];
    if (![[NSFileManager defaultManager] fileExistsAtPath:serverScript]) {
        showAlert(@"The game server is missing from the app.");
        return;
    }

    NSTask *task = [[NSTask alloc] init];
    task.executableURL = [NSURL fileURLWithPath:@"/usr/bin/python3"];
    task.arguments = @[
        serverScript,
        [NSString stringWithFormat:@"%d", port],
        gameDir
    ];
    task.terminationHandler = ^(NSTask *finished) {
        dispatch_async(dispatch_get_main_queue(), ^{
            if (terminating) return;
            [NSApp terminate:nil];
        });
    };
    NSString *logPath = [NSHomeDirectory() stringByAppendingPathComponent:@"Library/Logs/FreeThrowFrenzy.log"];
    [[NSFileManager defaultManager] createFileAtPath:logPath contents:nil attributes:nil];
    NSFileHandle *log = [NSFileHandle fileHandleForWritingAtPath:logPath];
    [log seekToEndOfFile];
    task.standardOutput = log;
    task.standardError = log;

    NSError *error = nil;
    if (![task launchAndReturnError:&error]) {
        showAlert(error.localizedDescription ?: @"The game server did not start.");
        return;
    }
    serverTask = task;

    [[NSString stringWithFormat:@"%d\n", port] writeToFile:portFile() atomically:YES encoding:NSUTF8StringEncoding error:nil];
    [[NSString stringWithFormat:@"%d\n", getpid()] writeToFile:pidFile() atomically:YES encoding:NSUTF8StringEncoding error:nil];

    BOOL ready = NO;
    for (int i = 0; i < 50; i++) {
        if (portAccepts(port)) {
            ready = YES;
            break;
        }
        if (!task.isRunning) break;
        usleep(100000);
    }
    if (!ready) {
        showAlert(@"The game server did not start.");
        return;
    }

    NSURL *url = [NSURL URLWithString:[NSString stringWithFormat:@"http://127.0.0.1:%d/", port]];
    dispatch_async(dispatch_get_main_queue(), ^{
        [[NSWorkspace sharedWorkspace] openURL:url];
        [NSApp activateIgnoringOtherApps:YES];
    });
}

- (void)applicationWillTerminate:(NSNotification *)notification {
    terminating = YES;
    if (serverTask != nil && serverTask.isRunning) {
        [serverTask terminate];
    }
    NSString *recorded = [NSString stringWithContentsOfFile:pidFile() encoding:NSUTF8StringEncoding error:nil];
    if ((pid_t)recorded.intValue == getpid()) {
        [[NSFileManager defaultManager] removeItemAtPath:pidFile() error:nil];
        [[NSFileManager defaultManager] removeItemAtPath:portFile() error:nil];
    }
}

@end

int main(int argc, const char *argv[]) {
    @autoreleasepool {
        NSApplication *app = [NSApplication sharedApplication];
        AppDelegate *delegate = [AppDelegate new];
        app.delegate = delegate;

        NSMenu *menubar = [[NSMenu alloc] init];
        NSMenuItem *appMenuItem = [[NSMenuItem alloc] init];
        [menubar addItem:appMenuItem];
        NSMenu *appMenu = [[NSMenu alloc] initWithTitle:@"Free Throw Frenzy"];
        NSMenuItem *quit = [[NSMenuItem alloc] initWithTitle:@"Quit Free Throw Frenzy"
                                                      action:@selector(terminate:)
                                               keyEquivalent:@"q"];
        [appMenu addItem:quit];
        appMenuItem.submenu = appMenu;
        app.mainMenu = menubar;

        [app setActivationPolicy:NSApplicationActivationPolicyRegular];
        [app run];
    }
    return 0;
}
