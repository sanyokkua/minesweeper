import type { Coordinate, GameCommand } from '../../domain/gameTypes'
import type { InputMode } from '../persistence/recordCodec'

export function primaryCommand(mode: InputMode, coordinate: Coordinate): GameCommand {
  return mode === 'reveal-first'
    ? { type: 'reveal', coordinate }
    : { type: 'toggleFlag', coordinate }
}

export function secondaryCommand(mode: InputMode, coordinate: Coordinate): GameCommand {
  return mode === 'reveal-first'
    ? { type: 'toggleFlag', coordinate }
    : { type: 'reveal', coordinate }
}
