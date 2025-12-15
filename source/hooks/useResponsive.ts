import { useEffect, useState } from 'react';

/**
 * Hook customizado para detectar se a tela é mobile (< 1024px)
 * Usado na transição automática entre layouts mobile e desktop
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    // Função para verificar tamanho da tela
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Verificar no mount
    checkMobile();

    // Adicionar listener para resize
    window.addEventListener('resize', checkMobile);

    // Limpar listener no unmount
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Retornar null enquanto não estiver hidratado
  return isMobile;
}

/**
 * Hook para detectar screen size exato para breakpoints customizados
 */
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState<{
    width: number | null;
    height: number | null;
  }>({ width: null, height: null });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}
