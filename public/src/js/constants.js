let urls = {
  GET_ALL_POSTS : 'https://push-notifications-anj.firebaseio.com/posts.json',
  ADD_SUBSCRIPTION : 'https://push-notifications-anj.firebaseio.com/subscriptions.json',
  ADD_POST : 'https://us-central1-push-notifications-anj.cloudfunctions.net/storePostData'
};

let DEFAULT_JSON_TYPE_HEADER = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};