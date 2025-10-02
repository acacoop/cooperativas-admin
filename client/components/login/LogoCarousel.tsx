import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './LogoCarousel.module.css';
import { getCoopLogos, type Logo } from '@/utils/getCoopLogos';

// Main logos that should always be shown (temporalmente ocultos)
const mainLogos: Logo[] = [
  // { src: '/logos/aca-logo.jpeg', alt: 'ACA Logo' },
  // { src: '/logos/gpi-logo.png', alt: 'GPI Logo' },
];

// Combine main logos with cooperative logos
const allLogos: Logo[] = [...mainLogos, ...getCoopLogos()];

export const LogoCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((current) => (current + 1) % allLogos.length);
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles.carouselContainer}>
      <div className={styles.carousel}>
        {allLogos.map((logo: Logo, index: number) => (
          <div
            key={logo.alt}
            className={`${styles.slide} ${index === currentSlide ? styles.active : ''}`}
          >
            <div className={styles.logoWrapper}>
              <Image
                src={logo.src}
                alt={logo.alt}
                width={180}
                height={180}
                className={styles.logo}
                priority={index === 0}
                />
            </div>
          </div>
        ))}
      </div>
      <div className={styles.indicators}>
        {allLogos.map((_: Logo, index: number) => (
          <button
            key={index}
            className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
            onClick={() => setCurrentSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default LogoCarousel;
