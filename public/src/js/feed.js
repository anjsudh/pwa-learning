var createPostArea = document.querySelector('#create-post');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
var titleInput = document.querySelector('#title');
let locationBtn = document.querySelector('#location-btn');
let locationLoader = document.querySelector('#location-loader');
let fetchedLocation = {lat: 0, lng: 0};
var locationInput = document.querySelector('#location');

locationBtn.addEventListener('click', function (event) {
  if (!(canGetLocation())) {
    return;
  }
  var sawAlert = false;
  locationBtn.style.display = 'none';
  locationLoader.style.display = 'block';
  fetchLocation((position) => {
    locationBtn.style.display = 'inline';
    locationLoader.style.display = 'none';
    locationInput.value = position.lat + " " + position.lng;
    fetchedLocation = position;
    document.querySelector('#manual-location').classList.add('is-focused');
  }, (position) => {
    locationBtn.style.display = 'inline';
    locationLoader.style.display = 'none';
    if (!sawAlert) {
      alert('Couldn\'t fetch location, please enter manually!');
      sawAlert = true;
    }
    fetchedLocation = position;
  });
});

function promptToAddAppIconToHomeScreen(handle) {
  handle.prompt();
  handle.userChoice.then(function (choiceResult) {
    console.log(choiceResult.outcome);
    if (choiceResult.outcome === 'dismissed') {
      console.log('User cancelled installation');
    } else {
      console.log('User added to home screen');
    }
  });
  handle = null;
  return handle;
}

function openCreatePostModal() {
  setTimeout(function () {
    createPostArea.style.transform = 'translateY(0)';
  }, 1);
  initializeMedia();
  if (!(canGetLocation())) {
    locationBtn.style.display = 'none';
  }
  if (deferredPrompt) {
    deferredPrompt = promptToAddAppIconToHomeScreen(deferredPrompt);
  }
}

function closeCreatePostModal() {
  imagePickerArea.style.display = 'none';
  videoPlayer.style.display = 'none';
  canvasElement.style.display = 'none';
  locationBtn.style.display = 'inline';
  locationLoader.style.display = 'none';
  captureButton.style.display = 'inline';
  stopVideoPlayer();
  setTimeout(function () {
    createPostArea.style.transform = 'translateY(100vh)';
  }, 1);
}

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function renderCard(data) {
  let cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  let cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearCards();
    for (var i = 0; i < data.length; i++) {
    renderCard(data[i]);
  }
}

let networkDataReceived = false;
fetch(urls.GET_ALL_POSTS)
  .then((res) => res.json())
  .then((data) => {
    networkDataReceived = true;
    let dataArray = [];
    for (let key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

if ('indexedDB' in window) {
  readAllData('posts')
    .then(function (data) {
      if (!networkDataReceived) {
        updateUI(data);
      }
    });
}

function sendData() {
  var id = new Date().toISOString();
  var postData = new FormData();
  postData.append('id', id);
  postData.append('title', titleInput.value);
  postData.append('location', locationInput.value);
  postData.append('rawLocationLat', fetchedLocation.lat);
  postData.append('rawLocationLng', fetchedLocation.lng);
  postData.append('file', picture, id + '.png');

  fetch('https://us-central1-push-notifications-anj.cloudfunctions.net/storePostData', {
    method: 'POST',
    body: postData
  })
    .then(function (res) {
      console.log('Sent data', res);
      updateUI();
    })
}

function validateFormInput() {
  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('Please enter valid data!');
    return false;
  }
  return true;
}

function sendDataInBackground() {
  navigator.serviceWorker.ready
    .then(function (sw) {
      let post = {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
        picture: picture,
        rawLocation: fetchedLocation
      };
      writeData('sync-posts', post)
        .then(() => {return sw.sync.register('sync-new-posts');})
        .then(() => showWillSendPostDataInBackgroundToast())
        .catch((err) => console.log(err));
    });
}

function showWillSendPostDataInBackgroundToast() {
  var snackbarContainer = document.querySelector('#confirmation-toast');
  var data = {message: 'Your Post was saved for syncing!'};
  snackbarContainer.MaterialSnackbar.showSnackbar(data);
}

form.addEventListener('submit', function (event) {
  event.preventDefault();
  if (validateFormInput() === false) {
    return;
  }
  closeCreatePostModal();
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    sendDataInBackground();
  } else {
    sendData();
  }
});