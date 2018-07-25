function canGetLocation() {
  return 'geolocation' in navigator;
}
function fetchLocation (onSuccess, onError) {
  navigator.geolocation.getCurrentPosition(
    (position) => onSuccess({lat: position.coords.latitude, lng: position.coords.longitude}),
    () => onError({lat: 0, lng: 0}),
    {timeout: 7000}
  );
}

