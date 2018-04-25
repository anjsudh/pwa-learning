var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
    window.Promise = Promise;
}
//Register the service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(function () {
            console.log('Service worker registered!');
        })
        .catch(function (err) {
            console.log(err);
        });
}

if ('Notification' in window && 'serviceWorker' in navigator) {
    for (var i = 0; i < enableNotificationsButtons.length; i++) {
        enableNotificationsButtons[i].style.display = 'inline-block';
        enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
    }
}

function askForNotificationPermission() {
    Notification.requestPermission((result) => {
        if (result == 'granted') {
            configurePushSubscription();
        }
    });
}

function configurePushSubscription() {
    if (!('serviceWorker' in navigator)) {
        return;
    }
    var reg;
    navigator.serviceWorker.ready
        .then((swreg) => {
            reg = swreg;
            return swreg.pushManager.getSubscription();
        })
        .then((sub) => {
            if (sub === null) {
                return createASubscription(reg);
            }
        })
        .then((newSub) => {
            return addSubscriptionToFirebase(newSub);
        })
        .then((res) => {
            if (res.ok) {
                displayConfirmNotification();
            }
        })
        .catch((err) => {
            console.log(err);
        });
}

function createASubscription(reg) {
    return reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('BA3JljQqVycSQuAP8E-TsCwjIexiwHaKcIdCGOwvUgHpgMXEC2c751wK2c4Sj5fa70CF1DZqSk1p30SFBTe6Hg4')
    });
}

function displayConfirmNotification() {
    if ('serviceWorker' in navigator) {
        var options = {
            body: 'You successfully subscribed to our Notification service!',
            icon: '/src/images/icons/app-icon-96x96.png',
            image: '/src/images/sf-boat.jpg',
            dir: 'ltr',
            lang: 'en-US', // BCP 47,
            vibrate: [100, 50, 200],
            badge: '/src/images/icons/app-icon-96x96.png',
            tag: 'confirm-notification',
            renotify: true,
            actions: [
                {action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png'},
                {action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png'}
            ]
        };

        navigator.serviceWorker.ready
            .then(function (swreg) {
                swreg.showNotification('Successfully subscribed!', options);
            });
    }
}

function addSubscriptionToFirebase(newSub) {
    return fetch('https://push-notifications-anj.firebaseio.com/subscriptions.json', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(newSub)
    })
}