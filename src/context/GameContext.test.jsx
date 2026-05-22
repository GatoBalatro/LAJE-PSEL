import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { GameProvider, GameContext } from './GameContext';
import React from 'react';

const wrapper = ({ children }) => <GameProvider>{children}</GameProvider>;

beforeEach(() => {
  vi.stubGlobal('Audio', vi.fn().mockImplementation(() => ({
    play: vi.fn().mockReturnValue(Promise.resolve()),
    pause: vi.fn(),
    load: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    volume: 0,
  })));
});

describe('GameContext Logic', () => {
  it('deve adicionar evidência ao inventário e disparar log', () => {
    const { result } = renderHook(() => React.useContext(GameContext), { wrapper });

    const evidence = { id: 'test.jpg', name: 'Test File' };

    act(() => {
      result.current.addEvidenceToInventory(evidence);
    });

    expect(result.current.inventory).toContainEqual(evidence);
    expect(result.current.hasEvidence('test.jpg')).toBe(true);
    
    const lastLog = result.current.logs[result.current.logs.length - 1];
    expect(lastLog).toContain('EVIDÊNCIA DETECTADA: Test File');
  });

  it('não deve permitir evidências duplicadas', () => {
    const { result } = renderHook(() => React.useContext(GameContext), { wrapper });
    const evidence = { id: 'unique.jpg', name: 'Unique' };

    act(() => {
      result.current.addEvidenceToInventory(evidence);
      result.current.addEvidenceToInventory(evidence);
    });

    expect(result.current.inventory.length).toBe(1);
  });
});