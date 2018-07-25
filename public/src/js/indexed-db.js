// Creating db tables
let dbPromise = idb.open('posts-store', 1, function (db) {
  if (!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', {keyPath: 'id'});
  }
  if (!db.objectStoreNames.contains('sync-posts')) {
    db.createObjectStore('sync-posts', {keyPath: 'id'});
  }
});

function writeData(st, data) {
  return getStore(st, 'readwrite', (tx, store) => {
    store.put(data);
    return tx.complete;
  });
}

function readAllData(st) {
  return getStore(st, 'readonly', (tx, store) => {
    return store.getAll();
  });
}

function clearAllData(st) {
  return getStore(st, 'readwrite', (tx, store) => {
    store.clear();
    return tx.complete;
  });
}

function deleteItemFromData(st, id) {
  return getStore(st, 'readwrite', (tx, store) => {
    store.delete(id);
    return tx.complete;
  });
}

function getStore(st, mode, callback) {
  return dbPromise
    .then(function(db) {
      const tx = db.transaction(st, mode);
      const store = tx.objectStore(st);
      return callback(tx, store);
    });
}