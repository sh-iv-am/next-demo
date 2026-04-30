export const loadHyper = ({
  clientUrl,
  publishableKey,
  profileId,
}: {
  clientUrl: string;
  publishableKey: string;
  profileId?: string;
}): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    if ((window as unknown as { Hyper?: { version?: string } }).Hyper?.version) {
      const hyperInstance = (window as unknown as { Hyper: (config: { publishableKey: string; profileId?: string }) => unknown }).Hyper({ publishableKey, profileId });
      resolve(hyperInstance);
      return;
    }

    const script = document.createElement('script');
    script.src = `${clientUrl}/HyperLoader.js`;
    script.async = true;

    script.onload = () => {
      try {
        const hyperInstance = (window as unknown as { Hyper: (config: { publishableKey: string; profileId?: string }) => unknown }).Hyper({ publishableKey, profileId });
        resolve(hyperInstance);
      } catch (err) {
        reject(err);
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load HyperLoader.js'));
    };

    document.head.appendChild(script);
  });
};