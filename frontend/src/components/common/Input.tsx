import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorMessage?: string;
}

export function Input({ label, errorMessage, id, className, ...rest }: InputProps) {
  const inputId = id ?? label;

  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[styles.input, errorMessage ? styles.error : '', className].filter(Boolean).join(' ')}
        {...rest}
      />
      {errorMessage && <span className={styles.errorMessage}>{errorMessage}</span>}
    </div>
  );
}
