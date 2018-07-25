var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
    window.Promise = Promise;
}
//Register the service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('Service worker registered!'))
        .catch((err) => console.log(err));
}

if ('Notification' in window && 'serviceWorker' in navigator) {
    for (var i = 0; i < enableNotificationsButtons.length; i++) {
        enableNotificationsButtons[i].style.display = 'inline-block';
        enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
    }
}