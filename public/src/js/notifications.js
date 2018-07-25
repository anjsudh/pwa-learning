
function askForNotificationPermission() {
    Notification.requestPermission((result) => {
        if (result === 'granted') {
            configurePushSubscription();
        }
    });
}

function configurePushSubscription() {
    let reg;
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
        .catch((err) => console.log(err));
}

function createASubscription(reg) {
    return reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('BA3JljQqVycSQuAP8E-TsCwjIexiwHaKcIdCGOwvUgHpgMXEC2c751wK2c4Sj5fa70CF1DZqSk1p30SFBTe6Hg4')
    });
}

function displayConfirmNotification() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then(function (swreg) {
                swreg.showNotification('Successfully subscribed!',
                  {
                    body: 'You successfully subscribed to our Notification service!',
                    icon: '/src/images/icons/app-icon-96x96.png',
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
                  });
            });
    }
}

function addSubscriptionToFirebase(newSub) {
    return fetch(urls.ADD_SUBSCRIPTION, {method: 'POST', headers: DEFAULT_JSON_TYPE_HEADER,
        body: JSON.stringify(newSub)
    })
}

function urlBase64ToUint8Array(base64String) {
  let padding = '='.repeat((4 - base64String.length % 4) % 4);
  let base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  let rawData = window.atob(base64);
  let outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}