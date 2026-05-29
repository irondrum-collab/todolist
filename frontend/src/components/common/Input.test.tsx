import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from './Input';

describe('Input', () => {
  it('label을 렌더링한다', () => {
    render(<Input label="이메일" />);
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
    expect(screen.getByText('이메일')).toBeInTheDocument();
  });

  it('label 없이도 렌더링된다', () => {
    render(<Input placeholder="이메일 입력" />);
    expect(screen.getByPlaceholderText('이메일 입력')).toBeInTheDocument();
  });

  it('errorMessage를 표시한다', () => {
    render(<Input label="이메일" errorMessage="올바른 이메일을 입력하세요" />);
    expect(screen.getByText('올바른 이메일을 입력하세요')).toBeInTheDocument();
  });

  it('errorMessage가 없으면 에러 텍스트를 표시하지 않는다', () => {
    render(<Input label="이메일" />);
    expect(screen.queryByText('올바른 이메일을 입력하세요')).not.toBeInTheDocument();
  });

  it('type="password"를 지원한다', () => {
    render(<Input label="비밀번호" type="password" />);
    expect(screen.getByLabelText('비밀번호')).toHaveAttribute('type', 'password');
  });

  it('사용자 입력을 받는다', async () => {
    render(<Input label="이름" />);
    const input = screen.getByLabelText('이름');
    await userEvent.type(input, '홍길동');
    expect(input).toHaveValue('홍길동');
  });

  it('onChange 핸들러를 호출한다', async () => {
    const onChange = vi.fn();
    render(<Input label="이름" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('이름'), '홍');
    expect(onChange).toHaveBeenCalled();
  });
});
