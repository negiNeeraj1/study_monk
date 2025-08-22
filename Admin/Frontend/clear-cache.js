// Clear Cache Utility for Admin Frontend Development
// Run this in browser console to clear all cached data

console.log('🧹 Clearing Admin Frontend Cache...');

// Clear localStorage
localStorage.clear();
console.log('✅ localStorage cleared');

// Clear sessionStorage
sessionStorage.clear();
console.log('✅ sessionStorage cleared');

// Unregister all service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
      console.log('🔄 Service worker unregistered');
    });
  });
}

// Clear IndexedDB (if any)
if ('indexedDB' in window) {
  indexedDB.databases().then(databases => {
    databases.forEach(db => {
      indexedDB.deleteDatabase(db.name);
      console.log(`🗄️ IndexedDB "${db.name}" deleted`);
    });
  });
}

// Clear caches (if using Cache API)
if ('caches' in window) {
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      caches.delete(cacheName);
      console.log(`🗂️ Cache "${cacheName}" deleted`);
    });
  });
}

console.log('🎉 Cache clearing complete! Refresh the page now.');
console.log('💡 Tip: Use Ctrl+Shift+R for hard refresh if needed');
