#import "AppDelegate.h"
#import <Firebase.h>  // Import Firebase
#import <UserNotifications/UserNotifications.h>  // Import for push notifications
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Initialize Firebase
  if ([FIRApp defaultApp] == nil) {
    [FIRApp configure];  // Ensure Firebase is configured
  }

  // Push Notification Permissions (iOS 10+)
  if (@available(iOS 10.0, *)) {
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    [center requestAuthorizationWithOptions:(UNAuthorizationOptionAlert + UNAuthorizationOptionSound + UNAuthorizationOptionBadge)
                        completionHandler:^(BOOL granted, NSError * _Nullable error) {
        if (granted) {
            NSLog(@"Notification permission granted.");
        } else {
            NSLog(@"Notification permission denied.");
        }
    }];
    [[UIApplication sharedApplication] registerForRemoteNotifications];  // Register for remote notifications
  } else {
    // For iOS < 10
    UIUserNotificationType allNotificationTypes = (UIUserNotificationTypeAlert |
                                                    UIUserNotificationTypeBadge |
                                                    UIUserNotificationTypeSound);
    UIUserNotificationSettings *settings = [UIUserNotificationSettings settingsForTypes:allNotificationTypes
                                                                               categories:nil];
    [[UIApplication sharedApplication] registerUserNotificationSettings:settings];
    [[UIApplication sharedApplication] registerForRemoteNotifications];
  }

  // Initialize Firebase Messaging (make sure messaging is correctly set)
  [FIRMessaging messaging].delegate = self;

  self.moduleName = @"BookSmart";
  self.initialProps = @{};  // Customize initial props if needed
  
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

// Handle device token registration for Firebase Messaging
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  // Pass the device token to Firebase Messaging
  [FIRMessaging messaging].APNSToken = deviceToken;
}

// Handle incoming notifications (foreground and background)
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
    fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  if ([FIRApp defaultApp] != nil) {
    [[FIRMessaging messaging] appDidReceiveMessage:userInfo];  // Handle Firebase message
  }
  completionHandler(UIBackgroundFetchResultNewData);  // Process the background fetch result
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
