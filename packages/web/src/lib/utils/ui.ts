export function isInViewport(element) {
  return new Promise((resolve) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          resolve(true);
        } else {
          resolve(false);
        }
        observer.disconnect();
      });
    });

    observer.observe(element);
  });
}

