self.addEventListener('push', event => {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon-512x512.png', // รูปใหญ่
        badge: '/icon-192x192.png', // รูปเล็ก
        
      })
    );
  });
    