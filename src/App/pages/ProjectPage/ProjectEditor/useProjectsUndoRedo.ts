import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useAtom } from 'jotai'
import { projectsAtom } from '@/App/atoms'
import type { Project } from '@/App/lib/types'

const UNDO_LIMIT = 10

// undo/redo over projectsAtom, alive only while the editor is mounted.
// records a step on every projects change (whoever made it — modals,
// timeline, sidebar), capped at UNDO_LIMIT
export function useProjectsUndoRedo() {
  const [projects, setProjects] = useAtom(projectsAtom)

  const pastRef = useRef<Project[][]>([])
  const futureRef = useRef<Project[][]>([])
  const previousProjectsRef = useRef(projects)
  const isTimeTravelingRef = useRef(false)
  // the stacks live in refs; this makes button disabled states re-render
  const [, setHistoryVersion] = useState(0)

  const recordChange = useEffectEvent(() => {
    if (projects === previousProjectsRef.current) {
      return
    }
    if (!isTimeTravelingRef.current) {
      pastRef.current = [...pastRef.current, previousProjectsRef.current].slice(-UNDO_LIMIT)
      futureRef.current = []
    }
    isTimeTravelingRef.current = false
    previousProjectsRef.current = projects
    setHistoryVersion((version) => version + 1)
  })

  useEffect(() => {
    recordChange()
  }, [projects])

  function undo() {
    const past = pastRef.current
    if (!past.length) {
      return
    }
    pastRef.current = past.slice(0, -1)
    futureRef.current = [previousProjectsRef.current, ...futureRef.current]
    isTimeTravelingRef.current = true
    setProjects(past[past.length - 1])
  }

  function redo() {
    const [next, ...restFuture] = futureRef.current
    if (!next) {
      return
    }
    futureRef.current = restFuture
    pastRef.current = [...pastRef.current, previousProjectsRef.current].slice(-UNDO_LIMIT)
    isTimeTravelingRef.current = true
    setProjects(next)
  }

  // cmd/ctrl+Z undo, cmd/ctrl+shift+Z redo; stands down while typing in a field
  const handleUndoRedoKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (event.code !== 'KeyZ' || !(event.metaKey || event.ctrlKey)) {
      return
    }
    const target = event.target instanceof HTMLElement ? event.target : null
    if (target?.closest('input, textarea, select, [contenteditable]')) {
      return
    }
    event.preventDefault()
    if (event.shiftKey) {
      redo()
    } else {
      undo()
    }
  })

  useEffect(() => {
    const listener = (event: KeyboardEvent) => handleUndoRedoKeyDown(event)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [])

  return {
    undo,
    redo,
    isUndoAvailable: !!pastRef.current.length,
    isRedoAvailable: !!futureRef.current.length,
  }
}
