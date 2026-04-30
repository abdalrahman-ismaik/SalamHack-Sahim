'use client';

import React, {
  Children,
  ReactNode,
  useLayoutEffect,
  useRef,
  useState,
  ButtonHTMLAttributes,
  HTMLAttributes,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './Stepper.module.css';

type StepperProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void | Promise<void>;
  stepCircleContainerClassName?: string;
  stepContainerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  backButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  nextButtonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  backButtonText?: string;
  nextButtonText?: string;
  completeButtonText?: string;
  disableStepIndicators?: boolean;
  renderStepIndicator?: (props: {
    step: number;
    currentStep: number;
    onStepClick: (step: number) => void;
  }) => ReactNode;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = () => {},
  onFinalStepCompleted = () => {},
  stepCircleContainerClassName = '',
  stepContainerClassName = '',
  contentClassName = '',
  footerClassName = '',
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = 'Back',
  nextButtonText = 'Continue',
  completeButtonText = 'Complete',
  disableStepIndicators = false,
  renderStepIndicator,
  ...rest
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = (newStep: number) => {
    setCurrentStep(newStep);
    if (newStep <= totalSteps) onStepChange(newStep);
  };

  const handleBack = () => {
    if (currentStep > 1 && !isCompleting) {
      setDirection(-1);
      updateStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (!isLastStep && !isCompleting) {
      setDirection(1);
      updateStep(currentStep + 1);
    }
  };

  const handleComplete = async () => {
    if (isCompleting) return;
    setDirection(1);
    setIsCompleting(true);
    try {
      await onFinalStepCompleted();
      setCurrentStep(totalSteps + 1);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className={styles.outerContainer} {...rest}>
      <div className={cx(styles.stepCircleContainer, stepCircleContainerClassName)}>
        <div className={cx(styles.stepIndicatorRow, stepContainerClassName)}>
          {stepsArray.map((_, index) => {
            const stepNumber = index + 1;
            const isNotLastStep = index < totalSteps - 1;
            return (
              <React.Fragment key={stepNumber}>
                {renderStepIndicator ? (
                  renderStepIndicator({
                    step: stepNumber,
                    currentStep,
                    onStepClick: clicked => {
                      if (isCompleting) return;
                      setDirection(clicked > currentStep ? 1 : -1);
                      updateStep(clicked);
                    },
                  })
                ) : (
                  <StepIndicator
                    step={stepNumber}
                    disableStepIndicators={disableStepIndicators || isCompleting}
                    currentStep={currentStep}
                    onClickStep={clicked => {
                      setDirection(clicked > currentStep ? 1 : -1);
                      updateStep(clicked);
                    }}
                  />
                )}
                {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} />}
              </React.Fragment>
            );
          })}
        </div>

        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className={cx(styles.stepContentDefault, contentClassName)}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted && (
          <div className={cx(styles.footerContainer, footerClassName)}>
            <div className={cx(styles.footerNav, currentStep !== 1 ? styles.footerNavSpread : styles.footerNavEnd)}>
              {currentStep !== 1 && (
                <button
                  type="button"
                  {...backButtonProps}
                  onClick={handleBack}
                  className={cx(styles.backButton, currentStep === 1 && styles.backButtonInactive, backButtonProps.className)}
                  disabled={isCompleting || backButtonProps.disabled}
                >
                  {backButtonText}
                </button>
              )}
              <button
                type="button"
                {...nextButtonProps}
                onClick={isLastStep ? handleComplete : handleNext}
                className={cx(styles.nextButton, nextButtonProps.className)}
                disabled={isCompleting || nextButtonProps.disabled}
              >
                {isCompleting ? completeButtonText : isLastStep ? completeButtonText : nextButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepContentWrapper({
  isCompleted,
  currentStep,
  direction,
  children,
  className,
}: {
  isCompleted: boolean;
  currentStep: number;
  direction: number;
  children: ReactNode;
  className: string;
}) {
  const [parentHeight, setParentHeight] = useState(0);

  return (
    <motion.div
      className={className}
      style={{ position: 'relative', overflow: 'hidden' }}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: 'spring', duration: 0.4 }}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition key={currentStep} direction={direction} onHeightReady={height => setParentHeight(height)}>
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SlideTransition({
  children,
  direction,
  onHeightReady,
}: {
  children: ReactNode;
  direction: number;
  onHeightReady: (height: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (containerRef.current) onHeightReady(containerRef.current.offsetHeight);
  }, [children, onHeightReady]);

  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.4 }}
      style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  );
}

const stepVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? '-100%' : '100%',
    opacity: 0,
  }),
  center: {
    x: '0%',
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? '50%' : '-50%',
    opacity: 0,
  }),
};

export function Step({ children }: { children: ReactNode }) {
  return <div className={styles.stepDefault}>{children}</div>;
}

function StepIndicator({
  step,
  currentStep,
  onClickStep,
  disableStepIndicators,
}: {
  step: number;
  currentStep: number;
  onClickStep: (step: number) => void;
  disableStepIndicators: boolean;
}) {
  const status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete';

  const handleClick = () => {
    if (step !== currentStep && !disableStepIndicators) onClickStep(step);
  };

  return (
    <motion.div
      onClick={handleClick}
      className={styles.stepIndicator}
      style={disableStepIndicators ? { pointerEvents: 'none', opacity: 0.5 } : undefined}
      animate={status}
      initial={false}
    >
      <motion.div
        variants={{
          inactive: { scale: 1, backgroundColor: '#222222', color: '#a3a3a3' },
          active: { scale: 1, backgroundColor: '#C5A059', color: '#050505' },
          complete: { scale: 1, backgroundColor: '#C5A059', color: '#050505' },
        }}
        transition={{ duration: 0.3 }}
        className={styles.stepIndicatorInner}
      >
        {status === 'complete' ? (
          <CheckIcon className={styles.checkIcon} />
        ) : status === 'active' ? (
          <div className={styles.activeDot} />
        ) : (
          <span className={styles.stepNumber}>{step}</span>
        )}
      </motion.div>
    </motion.div>
  );
}

function StepConnector({ isComplete }: { isComplete: boolean }) {
  return (
    <div className={styles.stepConnector}>
      <motion.div
        className={styles.stepConnectorInner}
        variants={{
          incomplete: { width: 0, backgroundColor: 'transparent' },
          complete: { width: '100%', backgroundColor: '#C5A059' },
        }}
        initial={false}
        animate={isComplete ? 'complete' : 'incomplete'}
        transition={{ duration: 0.4 }}
      />
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.1, type: 'tween', ease: 'easeOut', duration: 0.3 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}
