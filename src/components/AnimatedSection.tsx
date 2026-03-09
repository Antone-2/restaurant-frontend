import { ReactNode } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

interface AnimatedSectionProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    id?: string;
}

export const AnimatedSection = ({ children, className = "", delay = 0, id }: AnimatedSectionProps) => {
    const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
    });

    return (
        <div
            ref={ref}
            id={id}
            className={`transition-all duration-700 ease-out ${className} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

export const FadeIn = ({ children, className = "", delay = 0 }: AnimatedSectionProps) => {
    const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });

    return (
        <div
            ref={ref}
            className={`transition-opacity duration-700 ${className} ${isVisible ? "opacity-100" : "opacity-0"}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

export const SlideInLeft = ({ children, className = "", delay = 0 }: AnimatedSectionProps) => {
    const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${className} ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
                }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

export const SlideInRight = ({ children, className = "", delay = 0 }: AnimatedSectionProps) => {
    const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${className} ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
                }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

export const ScaleIn = ({ children, className = "", delay = 0 }: AnimatedSectionProps) => {
    const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.2 });

    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ease-out ${className} ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};
