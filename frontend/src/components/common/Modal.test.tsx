import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  it('isOpen=true이면 모달을 렌더링한다', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <p>모달 내용</p>
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('모달 내용')).toBeInTheDocument();
  });

  it('isOpen=false이면 모달을 렌더링하지 않는다', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <p>모달 내용</p>
      </Modal>
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('title을 표시한다', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="삭제 확인">
        <p>내용</p>
      </Modal>
    );
    expect(screen.getByText('삭제 확인')).toBeInTheDocument();
  });

  it('오버레이 클릭 시 onClose를 호출한다', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>내용</p>
      </Modal>
    );
    await userEvent.click(screen.getByRole('dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ESC 키 입력 시 onClose를 호출한다', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>내용</p>
      </Modal>
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('onConfirm이 있으면 확인·취소 버튼을 표시한다', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} confirmLabel="삭제">
        <p>내용</p>
      </Modal>
    );
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  it('확인 버튼 클릭 시 onConfirm을 호출한다', async () => {
    const onConfirm = vi.fn();
    render(
      <Modal isOpen={true} onClose={vi.fn()} onConfirm={onConfirm} confirmLabel="삭제">
        <p>내용</p>
      </Modal>
    );
    await userEvent.click(screen.getByRole('button', { name: '삭제' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('취소 버튼 클릭 시 onClose를 호출한다', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} onConfirm={vi.fn()} confirmLabel="삭제">
        <p>내용</p>
      </Modal>
    );
    await userEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('다이얼로그 내부 클릭 시 onClose를 호출하지 않는다', async () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <p>내용</p>
      </Modal>
    );
    await userEvent.click(screen.getByText('내용'));
    expect(onClose).not.toHaveBeenCalled();
  });
});
