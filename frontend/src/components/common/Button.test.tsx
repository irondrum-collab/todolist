import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('children 텍스트를 렌더링한다', () => {
    render(<Button>저장</Button>);
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
  });

  it('기본 variant는 primary이다', () => {
    render(<Button>확인</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('primary');
  });

  it('secondary variant를 렌더링한다', () => {
    render(<Button variant="secondary">취소</Button>);
    expect(screen.getByRole('button').className).toContain('secondary');
  });

  it('danger variant를 렌더링한다', () => {
    render(<Button variant="danger">삭제</Button>);
    expect(screen.getByRole('button').className).toContain('danger');
  });

  it('disabled 상태일 때 버튼이 비활성화된다', () => {
    render(<Button disabled>확인</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('loading 상태일 때 "로딩 중..." 텍스트를 표시하고 비활성화된다', () => {
    render(<Button loading>저장</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveTextContent('로딩 중...');
    expect(btn).toBeDisabled();
  });

  it('클릭 시 onClick 핸들러를 호출한다', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>클릭</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태에서는 onClick이 호출되지 않는다', async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>클릭</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
