jest.mock('../../repositories/todoRepository');
jest.mock('../../repositories/categoryRepository');
jest.mock('../../utils/todoStatus');

const todoRepository = require('../../repositories/todoRepository');
const categoryRepository = require('../../repositories/categoryRepository');
const { calcStatus } = require('../../utils/todoStatus');
const { create, getList, update, remove } = require('../../services/todoService');

beforeEach(() => {
  jest.clearAllMocks();
  calcStatus.mockReturnValue('진행 중 (날짜 없음)');
});

const makeRow = (overrides = {}) => ({
  id: 1,
  title: '테스트 할 일',
  description: null,
  start_date: null,
  end_date: null,
  is_completed: false,
  category_id: 10,
  user_id: 100,
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

describe('todoService.create', () => {
  test('categoryId 없을 때 findDefaultByUser 호출', async () => {
    categoryRepository.findDefaultByUser.mockResolvedValue({ id: 10 });
    todoRepository.create.mockResolvedValue(makeRow());

    await create(100, { title: '할 일', description: null });

    expect(categoryRepository.findDefaultByUser).toHaveBeenCalledWith(100);
    expect(todoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 10, userId: 100 })
    );
  });

  test('categoryId 있을 때 findDefaultByUser 미호출', async () => {
    todoRepository.create.mockResolvedValue(makeRow({ category_id: 5 }));

    await create(100, { title: '할 일', categoryId: 5 });

    expect(categoryRepository.findDefaultByUser).not.toHaveBeenCalled();
    expect(todoRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: 5 })
    );
  });
});

describe('todoService.update', () => {
  test('소유권 검사 → 403', async () => {
    todoRepository.findById.mockResolvedValue(makeRow({ user_id: 999 }));

    await expect(update(100, 1, { title: '변경' })).rejects.toMatchObject({
      status: 403,
      message: '다른 사용자의 할 일을 수정할 수 없습니다.',
    });
  });

  test('날짜 유효성 검사 → 400 (endDate < startDate)', async () => {
    todoRepository.findById.mockResolvedValue(makeRow({ user_id: 100 }));

    await expect(
      update(100, 1, { startDate: '2024-12-31', endDate: '2024-01-01' })
    ).rejects.toMatchObject({
      status: 400,
      message: '종료일자는 시작일자보다 같거나 이후여야 합니다.',
    });
  });

  test('존재하지 않는 할 일 → 404', async () => {
    todoRepository.findById.mockResolvedValue(null);

    await expect(update(100, 999, { title: '변경' })).rejects.toMatchObject({
      status: 404,
    });
  });

  test('정상 업데이트', async () => {
    todoRepository.findById.mockResolvedValue(makeRow({ user_id: 100 }));
    todoRepository.update.mockResolvedValue(makeRow({ title: '변경된 제목' }));

    const result = await update(100, 1, { title: '변경된 제목' });

    expect(todoRepository.update).toHaveBeenCalledWith(1, { title: '변경된 제목' });
    expect(result.title).toBe('변경된 제목');
  });
});

describe('todoService.remove', () => {
  test('소유권 검사 → 403', async () => {
    todoRepository.findById.mockResolvedValue(makeRow({ user_id: 999 }));

    await expect(remove(100, 1)).rejects.toMatchObject({
      status: 403,
      message: '다른 사용자의 할 일을 삭제할 수 없습니다.',
    });
  });

  test('존재하지 않는 할 일 → 404', async () => {
    todoRepository.findById.mockResolvedValue(null);

    await expect(remove(100, 999)).rejects.toMatchObject({ status: 404 });
  });

  test('정상 삭제', async () => {
    todoRepository.findById.mockResolvedValue(makeRow({ user_id: 100 }));
    todoRepository.remove.mockResolvedValue();

    await remove(100, 1);

    expect(todoRepository.remove).toHaveBeenCalledWith(1);
  });
});

describe('todoService.getList', () => {
  test('status 필터 동작', async () => {
    todoRepository.findAllByUser.mockResolvedValue([
      makeRow({ id: 1, is_completed: true }),
      makeRow({ id: 2, is_completed: false }),
    ]);

    calcStatus
      .mockReturnValueOnce('완료')
      .mockReturnValueOnce('진행 중 (날짜 없음)');

    const todos = await getList(100, { status: '완료' });

    expect(todos).toHaveLength(1);
    expect(todos[0].status).toBe('완료');
  });

  test('status 필터 없을 때 전체 반환', async () => {
    todoRepository.findAllByUser.mockResolvedValue([
      makeRow({ id: 1 }),
      makeRow({ id: 2 }),
    ]);
    calcStatus.mockReturnValue('진행 중 (날짜 없음)');

    const todos = await getList(100, {});

    expect(todos).toHaveLength(2);
  });
});
