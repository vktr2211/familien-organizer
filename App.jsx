import {
  AlertCircle,
  AlertTriangle,
  Bell,
  BellDot,
  BellRing,
  Building,
  Calendar,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Home,
  ListChecks,
  Loader2,
  Mic,
  Pencil,
  Plus,
  QrCode,
  Settings,
  Trash2,
  User,
  Users,
  Heart,
  Briefcase,
  Sparkles,
  X
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

const iconLibrary = {
  briefcase: Briefcase,
  building: Building,
  home: Home,
  user: User,
  users: Users,
  heart: Heart,
  calendar: Calendar,
  bell: Bell,
  list: ListChecks,
  sparkles: Sparkles
}

const defaultAreas = [
  { id: 'work', name: 'Arbeit', color: '#3b82f6', icon: 'briefcase', isDefault: true },
  { id: 'company-a', name: 'Unternehmen A', color: '#10b981', icon: 'building', isDefault: true },
  { id: 'company-b', name: 'Unternehmen B', color: '#8b5cf6', icon: 'building', isDefault: true },
  { id: 'private', name: 'Privat', color: '#fb923c', icon: 'user', isDefault: true },
  { id: 'family', name: 'Familie', color: '#ef4444', icon: 'users', isDefault: true },
  { id: 'household', name: 'Haushalt', color: '#f59e0b', icon: 'home', isDefault: true }
]

const defaultMembers = [
  { id: 'me', name: 'Ich', avatar: '👤', isDefault: true },
  { id: 'partner', name: 'Partner/in', avatar: '❤️', isDefault: true },
  { id: 'child-1', name: 'Kind 1', avatar: '👧', isDefault: true },
  { id: 'child-2', name: 'Kind 2', avatar: '👦', isDefault: true }
]

const defaultTasks = [
  {
    id: 't-1',
    title: 'Wocheneinkauf planen',
    areaId: 'household',
    assigneeId: 'partner',
    dueDate: new Date().toISOString().slice(0, 10),
    priority: 'normal',
    status: 'open',
    creatorId: 'me',
    createdAt: Date.now()
  },
  {
    id: 't-2',
    title: 'Quartalsbericht vorbereiten',
    areaId: 'work',
    assigneeId: 'me',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    priority: 'high',
    status: 'open',
    creatorId: 'me',
    createdAt: Date.now()
  },
  {
    id: 't-3',
    title: 'Müll rausbringen',
    areaId: 'household',
    assigneeId: 'child-1',
    dueDate: new Date().toISOString().slice(0, 10),
    priority: 'normal',
    status: 'open',
    creatorId: 'partner',
    createdAt: Date.now()
  }
]

const defaultNotifications = [
  {
    id: 'n-1',
    message: 'Partner/in hat dir "Wocheneinkauf planen" zugewiesen',
    forUserId: 'me',
    createdAt: Date.now() - 1000 * 60 * 60,
    read: false,
    type: 'assignment'
  },
  {
    id: 'n-2',
    message: 'Aufgabe "Müll rausbringen" ist heute fällig',
    forUserId: 'child-1',
    createdAt: Date.now() - 1000 * 60 * 30,
    read: false,
    type: 'due'
  }
]

const priorityOptions = [
  { value: 'low', label: 'Niedrig' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'Hoch' }
]

const navItems = [
  { key: 'today', label: 'Heute', icon: Calendar },
  { key: 'week', label: 'Diese Woche', icon: Clock },
  { key: 'family', label: 'Familie', icon: Users },
  { key: 'all', label: 'Alle', icon: ListChecks },
  { key: 'notifications', label: 'Mitteilungen', icon: Bell },
  { key: 'settings', label: 'Einstellungen', icon: Settings }
]

const storageKeys = {
  areas: 'familien-organizer-areas',
  members: 'familien-organizer-members',
  tasks: 'familien-organizer-tasks',
  notifications: 'familien-organizer-notifications',
  familyMeta: 'familien-organizer-meta'
}

const emojiChoices = ['👤', '❤️', '👧', '👦', '👵', '👴', '👨‍👩‍👧‍👦', '🐶', '🧑‍🍳', '🧑‍🎓', '🧑‍🔧']

const iconChoices = [
  { value: 'briefcase', label: 'Arbeit' },
  { value: 'building', label: 'Unternehmen' },
  { value: 'home', label: 'Haushalt' },
  { value: 'user', label: 'Privat' },
  { value: 'users', label: 'Familie' },
  { value: 'heart', label: 'Care' },
  { value: 'calendar', label: 'Termine' },
  { value: 'bell', label: 'Benachrichtigungen' },
  { value: 'list', label: 'Listen' },
  { value: 'sparkles', label: 'Kreativ' }
]

const colorChoices = ['#3b82f6', '#10b981', '#8b5cf6', '#fb923c', '#ef4444', '#f59e0b', '#0ea5e9', '#f97316']

const parseDate = (value) => (value ? new Date(value) : null)

const formatDate = (value) => {
  if (!value) return 'Kein Datum'
  return new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: 'numeric', month: 'short' }).format(
    new Date(value)
  )
}

const loadState = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed
  } catch (error) {
    console.warn('Konnte Zustand nicht laden', key, error)
    return fallback
  }
}

const saveState = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.warn('Konnte Zustand nicht speichern', key, error)
  }
}

const generateId = (prefix) => {
  let unique = ''
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    unique = crypto.randomUUID()
  } else {
    unique = Math.random().toString(16).slice(2)
  }
  return `${prefix}-${unique}`
}

const getSpeechRecognition = () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) return null
  const recognition = new SpeechRecognition()
  recognition.lang = 'de-DE'
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  return recognition
}

const detectKeywords = (text, keywords) => {
  const lower = text.toLowerCase()
  return keywords.find((item) => item.keywords.some((word) => lower.includes(word)))
}

const parseSpeechText = (text, members, areas) => {
  const normalized = text.trim()
  const lower = normalized.toLowerCase()

  const memberMapping = [
    { id: 'me', keywords: ['ich', 'selbst', 'mir'] },
    { id: 'partner', keywords: ['mama', 'papa', 'partner', 'ehefrau', 'ehemann', 'frau', 'mann'] },
    { id: 'child-1', keywords: ['kind 1', 'tochter', 'sohn', 'kind', 'julia', 'max'] },
    { id: 'child-2', keywords: ['kind 2', 'bruder', 'schwester', 'junior'] }
  ]

  const areaMapping = [
    { id: 'household', keywords: ['einkaufen', 'einkauf', 'müll', 'haushalt', 'auf räumen', 'putzen'] },
    { id: 'work', keywords: ['arbeit', 'büro', 'projekt', 'bericht'] },
    { id: 'family', keywords: ['familie', 'ausflug', 'gemeinsam'] },
    { id: 'private', keywords: ['privat', 'sport', 'arzt'] }
  ]

  const priorityMapping = [
    { id: 'high', keywords: ['wichtig', 'dringend', 'sofort'] },
    { id: 'low', keywords: ['später', 'egal', 'wenn zeit'] }
  ]

  const detectedMember = detectKeywords(lower, memberMapping)
  const detectedArea = detectKeywords(lower, areaMapping)
  const detectedPriority = detectKeywords(lower, priorityMapping)

  let dueDate = null
  if (lower.includes('heute')) {
    dueDate = new Date().toISOString().slice(0, 10)
  } else if (lower.includes('morgen')) {
    dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  } else if (lower.includes('übermorgen')) {
    dueDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  }

  const fallbackMember = members.find((member) => member.id === 'me') ?? members[0]
  const fallbackArea = areas.find((area) => area.id === 'household') ?? areas[0]
  const resolvedMemberId = detectedMember ? detectedMember.id : undefined
  const resolvedAreaId = detectedArea ? detectedArea.id : undefined
  const resolvedPriorityId = detectedPriority ? detectedPriority.id : 'normal'
  const resolvedMember = members.find((member) => member.id === resolvedMemberId) ?? fallbackMember
  const resolvedArea = areas.find((area) => area.id === resolvedAreaId) ?? fallbackArea

  return {
    title: normalized.charAt(0).toUpperCase() + normalized.slice(1),
    assigneeId: resolvedMember.id,
    areaId: resolvedArea.id,
    priority: resolvedPriorityId,
    dueDate
  }
}

const SectionCard = ({ title, description, actions, children }) => (
  <section className="mb-6 rounded-3xl bg-white p-5 shadow-card">
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description ? <p className="text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
    <div>{children}</div>
  </section>
)

const Badge = ({ color, label }) => (
  <span
    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white"
    style={{ backgroundColor: color }}
  >
    {label}
  </span>
)

const Field = ({ label, htmlFor, children }) => (
  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700" htmlFor={htmlFor}>
    {label}
    {children}
  </label>
)

const FloatingMicButton = ({ onClick, disabled, isListening }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="fixed bottom-24 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-2xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:opacity-40 sm:bottom-10 sm:right-10"
  >
    {isListening ? <Loader2 className="animate-spin" size={28} /> : <Mic size={28} />}
    <span className="sr-only">Spracheingabe starten</span>
  </button>
)

const TaskCard = ({ task, area, assignee, onToggleStatus, onEdit, onDelete }) => {
  const Icon = iconLibrary[area?.icon] ?? Circle
  return (
    <article className="group mb-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-primary/40 hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => onToggleStatus(task)}
          className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary text-primary transition hover:bg-primary hover:text-white"
        >
          {task.status === 'done' ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        </button>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Icon size={18} className="text-slate-400" />
            <h3 className="text-base font-semibold text-slate-900">{task.title}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <Badge color={area?.color ?? '#cbd5f5'} label={area?.name ?? 'Bereich'} />
            <span className="inline-flex items-center gap-1">
              <User size={14} /> {assignee?.name ?? 'Unbekannt'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar size={14} /> {formatDate(task.dueDate)}
            </span>
            <span className="inline-flex items-center gap-1">
              <AlertCircle size={14} /> Priorität: {priorityOptions.find((option) => option.value === task.priority)?.label}
            </span>
            {task.status === 'done' ? (
              <span className="inline-flex items-center gap-1 text-success">
                <CheckCheck size={14} /> Erledigt
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-primary/10 hover:text-primary"
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-danger/10 hover:text-danger"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}

const NotificationItem = ({ notification, onToggleRead }) => (
  <li className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-800">{notification.message}</p>
        <p className="mt-1 text-xs text-slate-400">
          {new Intl.DateTimeFormat('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
          }).format(notification.createdAt)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onToggleRead(notification)}
        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-primary/10 hover:text-primary"
      >
        {notification.read ? 'Als ungelesen markieren' : 'Als gelesen' }
      </button>
    </div>
  </li>
)

const TabsBar = ({ items, active, onChange, notificationCount }) => (
  <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/75">
    <div className="mx-auto grid max-w-4xl grid-cols-6 gap-1 px-2 py-3 text-xs font-medium sm:text-sm">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = active === item.key
        const isNotifications = item.key === 'notifications'
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={`relative flex flex-col items-center gap-1 rounded-2xl px-2 py-2 transition ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Icon size={20} />
            <span>{item.label}</span>
            {isNotifications && notificationCount > 0 ? (
              <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-danger text-[10px] font-semibold leading-5 text-white">
                {notificationCount}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  </nav>
)

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
          >
            <span className="sr-only">Schließen</span>
            <X size={16} />
          </button>
        </header>
        <div className="max-h-[75vh] overflow-y-auto pr-2">{children}</div>
      </div>
    </div>
  )
}

const DemoSpeechSuggestions = ({ onSelect }) => (
  <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">
    <p className="font-semibold text-slate-800">Schnell ausprobieren</p>
    <div className="mt-3 flex flex-wrap gap-2">
      {[
        'Mama soll heute einkaufen gehen',
        'Wichtig: Quartalsbericht fertigstellen',
        'Kind soll Müll rausbringen'
      ].map((example) => (
        <button
          key={example}
          type="button"
          onClick={() => onSelect(example)}
          className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-primary shadow-sm transition hover:bg-primary hover:text-white"
        >
          {example}
        </button>
      ))}
    </div>
  </div>
)

const QRPreview = ({ code }) => {
  if (!code) return null
  const qrData = encodeURIComponent(JSON.stringify(code))
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrData}`
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-600">
      <img src={url} alt="Familien QR-Code" className="h-44 w-44 rounded-2xl border border-slate-200 bg-white p-3" />
      <code className="rounded-lg bg-white px-3 py-2 text-xs text-slate-700">{code.familyId}</code>
      <p className="text-xs text-slate-500">
        Der QR-Code enthält eine verschlüsselte Einladung. Teile ihn nur mit vertrauenswürdigen Personen.
      </p>
    </div>
  )
}

export default function App() {
  const [areas, setAreas] = useState(() => loadState(storageKeys.areas, defaultAreas))
  const [members, setMembers] = useState(() => loadState(storageKeys.members, defaultMembers))
  const [tasks, setTasks] = useState(() => loadState(storageKeys.tasks, defaultTasks))
  const [notifications, setNotifications] = useState(() => loadState(storageKeys.notifications, defaultNotifications))
  const [currentUserId, setCurrentUserId] = useState(() => loadState(storageKeys.familyMeta, { currentUserId: 'me' }).currentUserId)
  const [activeTab, setActiveTab] = useState('today')
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [areaModalOpen, setAreaModalOpen] = useState(false)
  const [areaDraft, setAreaDraft] = useState({ id: '', name: '', color: '#3b82f6', icon: 'briefcase' })
  const [memberModalOpen, setMemberModalOpen] = useState(false)
  const [memberDraft, setMemberDraft] = useState({ id: '', name: '', avatar: emojiChoices[0] })
  const [speechSupported, setSpeechSupported] = useState(true)
  const recognitionRef = useRef(null)
  const [isListening, setIsListening] = useState(false)
  const [speechDraft, setSpeechDraft] = useState('')
  const [qrData, setQrData] = useState(null)
  const [expandedTaskSections, setExpandedTaskSections] = useState({})

  const today = new Date().toISOString().slice(0, 10)
  const startOfWeek = useMemo(() => {
    const now = new Date()
    const diff = now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)
    const monday = new Date(now.setDate(diff))
    return monday
  }, [])

  useEffect(() => {
    saveState(storageKeys.areas, areas)
  }, [areas])

  useEffect(() => {
    saveState(storageKeys.members, members)
  }, [members])

  useEffect(() => {
    saveState(storageKeys.tasks, tasks)
  }, [tasks])

  useEffect(() => {
    saveState(storageKeys.notifications, notifications)
  }, [notifications])

  useEffect(() => {
    saveState(storageKeys.familyMeta, { currentUserId })
  }, [currentUserId])

  useEffect(() => {
    recognitionRef.current = getSpeechRecognition()
    setSpeechSupported(Boolean(recognitionRef.current))
  }, [])

  const openTaskModal = (task = null) => {
    setEditingTask(task)
    setTaskModalOpen(true)
  }

  const closeTaskModal = () => {
    setEditingTask(null)
    setSpeechDraft('')
    setTaskModalOpen(false)
  }

  const handleTaskSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const payload = {
      title: formData.get('title').toString().trim(),
      areaId: formData.get('area'),
      assigneeId: formData.get('assignee'),
      dueDate: formData.get('dueDate') || null,
      priority: formData.get('priority'),
      status: formData.get('status'),
      creatorId: currentUserId
    }

    if (!payload.title) {
      alert('Bitte gib einen Titel ein.')
      return
    }

    const isEditing = Boolean(editingTask?.id)

    if (isEditing) {
      setTasks((prev) => prev.map((task) => (task.id === editingTask.id ? { ...task, ...payload } : task)))
    } else {
      const newTask = {
        ...payload,
        id: generateId('task'),
        createdAt: Date.now()
      }
      setTasks((prev) => [...prev, newTask])
      if (payload.assigneeId !== currentUserId) {
        const assignee = members.find((member) => member.id === payload.assigneeId)
        if (assignee) {
          setNotifications((prev) => [
            {
              id: generateId('notification'),
              message: `${members.find((member) => member.id === currentUserId)?.name ?? 'Jemand'} hat dir "${payload.title}" zugewiesen`,
              forUserId: payload.assigneeId,
              createdAt: Date.now(),
              read: false,
              type: 'assignment'
            },
            ...prev
          ])
        }
      }
    }

    closeTaskModal()
  }

  const toggleTaskStatus = (task) => {
    setTasks((prev) =>
      prev.map((item) =>
        item.id === task.id
          ? {
              ...item,
              status: item.status === 'done' ? 'open' : 'done'
            }
          : item
      )
    )
  }

  const deleteTask = (task) => {
    if (!confirm('Aufgabe wirklich löschen?')) return
    setTasks((prev) => prev.filter((item) => item.id !== task.id))
  }

  const startCreateArea = () => {
    setAreaDraft({ id: '', name: '', color: '#3b82f6', icon: 'briefcase' })
    setAreaModalOpen(true)
  }

  const startEditArea = (area) => {
    setAreaDraft({ id: area.id, name: area.name, color: area.color, icon: area.icon, isDefault: area.isDefault })
    setAreaModalOpen(true)
  }

  const closeAreaModal = () => {
    setAreaModalOpen(false)
    setAreaDraft({ id: '', name: '', color: '#3b82f6', icon: 'briefcase' })
  }

  const startCreateMember = () => {
    setMemberDraft({ id: '', name: '', avatar: emojiChoices[0] })
    setMemberModalOpen(true)
  }

  const startEditMember = (member) => {
    setMemberDraft({ id: member.id, name: member.name, avatar: member.avatar, isDefault: member.isDefault })
    setMemberModalOpen(true)
  }

  const closeMemberModal = () => {
    setMemberModalOpen(false)
    setMemberDraft({ id: '', name: '', avatar: emojiChoices[0] })
  }

  const handleAreaSubmit = (event) => {
    event.preventDefault()
    const id = areaDraft.id || generateId('area')
    const existing = areas.find((area) => area.id === areaDraft.id)
    const area = {
      id,
      name: areaDraft.name.trim(),
      color: areaDraft.color,
      icon: areaDraft.icon,
      isDefault: existing?.isDefault ?? Boolean(areaDraft.isDefault)
    }

    if (!area.name) {
      alert('Bitte einen Namen für den Bereich eingeben.')
      return
    }

    if (existing) {
      setAreas((prev) => prev.map((item) => (item.id === area.id ? area : item)))
    } else {
      setAreas((prev) => [...prev, area])
    }

    closeAreaModal()
  }

  const handleMemberSubmit = (event) => {
    event.preventDefault()
    const id = memberDraft.id || generateId('member')
    const existing = members.find((member) => member.id === memberDraft.id)
    const member = {
      id,
      name: memberDraft.name.trim(),
      avatar: memberDraft.avatar,
      isDefault: existing?.isDefault ?? Boolean(memberDraft.isDefault)
    }

    if (!member.name) {
      alert('Bitte gib einen Namen ein.')
      return
    }

    if (existing) {
      setMembers((prev) => prev.map((item) => (item.id === member.id ? member : item)))
    } else {
      setMembers((prev) => [...prev, member])
    }

    setMemberDraft({ id: '', name: '', avatar: emojiChoices[0] })
    closeMemberModal()
  }

  const deleteArea = (area) => {
    if (area.isDefault && !confirm('Standardbereiche können nur mit Bestätigung gelöscht werden. Fortfahren?')) {
      return
    }
    const fallbackAreaId = areas.find((item) => item.id !== area.id)?.id ?? 'private'
    setAreas((prev) => prev.filter((item) => item.id !== area.id))
    setTasks((prev) => prev.map((task) => (task.areaId === area.id ? { ...task, areaId: fallbackAreaId } : task)))
  }

  const deleteMember = (member) => {
    if (member.isDefault && member.id === 'me') {
      alert('Das eigene Profil kann nicht gelöscht werden.')
      return
    }
    if (member.isDefault && !confirm('Standard-Mitglieder nur mit Bestätigung löschen. Weiter?')) {
      return
    }
    setMembers((prev) => prev.filter((item) => item.id !== member.id))
    setTasks((prev) => prev.map((task) => (task.assigneeId === member.id ? { ...task, assigneeId: 'me' } : task)))
  }

  const toggleNotificationRead = (notification) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === notification.id ? { ...item, read: !item.read } : item))
    )
  }

  const unreadNotifications = notifications.filter((notification) => !notification.read && notification.forUserId === currentUserId)

  const filteredTasks = useMemo(() => {
    const userTasks = tasks.filter((task) => task.assigneeId === currentUserId)
    switch (activeTab) {
      case 'today':
        return userTasks.filter((task) => task.dueDate === today && task.status === 'open')
      case 'week': {
        const weekEnd = new Date(startOfWeek)
        weekEnd.setDate(weekEnd.getDate() + 7)
        return tasks.filter((task) => {
          if (!task.dueDate) return false
          const due = parseDate(task.dueDate)
          return due >= startOfWeek && due <= weekEnd
        })
      }
      case 'family':
        return tasks.filter((task) => task.status === 'open')
      case 'all':
        return tasks
      default:
        return userTasks
    }
  }, [activeTab, currentUserId, startOfWeek, tasks, today])

  const taskSections = useMemo(() => {
    if (activeTab !== 'family' && activeTab !== 'all') return null
    const grouped = tasks.reduce((acc, task) => {
      const areaId = task.areaId ?? 'other'
      if (!acc[areaId]) acc[areaId] = []
      acc[areaId].push(task)
      return acc
    }, {})
    return Object.entries(grouped).map(([areaId, areaTasks]) => ({
      area: areas.find((area) => area.id === areaId),
      tasks: areaTasks.sort((a, b) => (a.status === 'done') - (b.status === 'done'))
    }))
  }, [activeTab, areas, tasks])

  const startSpeechRecognition = () => {
    if (!speechSupported) {
      alert('Spracheingabe wird von diesem Browser nicht unterstützt. Nutze den Demo-Modus unten.')
      return
    }

    const recognition = recognitionRef.current
    if (!recognition) {
      setSpeechSupported(false)
      return
    }

    recognition.start()
    setIsListening(true)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setSpeechDraft(transcript)
      const parsed = parseSpeechText(transcript, members, areas)
      setEditingTask({
        id: null,
        ...parsed,
        status: 'open'
      })
      setTaskModalOpen(true)
    }
    recognition.onerror = (event) => {
      console.error('Spracherkennung Fehler', event)
      alert('Die Spracheingabe ist fehlgeschlagen. Bitte erneut versuchen.')
    }
    recognition.onend = () => {
      setIsListening(false)
    }
  }

  const handleSpeechDemo = (example) => {
    setSpeechDraft(example)
    const parsed = parseSpeechText(example, members, areas)
    setEditingTask({ id: null, ...parsed, status: 'open' })
    setTaskModalOpen(true)
  }

  const handleQRCodeGeneration = () => {
    let invitationId = ''
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      invitationId = crypto.randomUUID()
    } else {
      invitationId = Math.random().toString(36).slice(2)
    }
    const code = {
      familyId: `fam-${invitationId}`,
      inviter: currentUserId,
      timestamp: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60 * 24
    }
    setQrData(code)
  }

  const toggleSection = (areaId) => {
    setExpandedTaskSections((prev) => ({
      ...prev,
      [areaId]: !prev[areaId]
    }))
  }

  const renderTaskList = (list) => {
    if (!list.length) {
      return (
        <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          Keine Aufgaben in dieser Ansicht. Leg jetzt los!
        </div>
      )
    }
    return list.map((task) => (
      <TaskCard
        key={task.id}
        task={task}
        area={areas.find((area) => area.id === task.areaId)}
        assignee={members.find((member) => member.id === task.assigneeId)}
        onToggleStatus={toggleTaskStatus}
        onEdit={openTaskModal}
        onDelete={deleteTask}
      />
    ))
  }

  const activeUser = members.find((member) => member.id === currentUserId) ?? members[0]

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col bg-gray-50 pb-28">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-gray-50/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Familien-Organizer</p>
            <h1 className="text-2xl font-bold text-slate-900">Gemeinsam alles im Blick</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white px-4 py-2 shadow-sm">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                <span role="img" aria-label="avatar">
                  {activeUser?.avatar ?? '👤'}
                </span>
                <select
                  value={currentUserId}
                  onChange={(event) => setCurrentUserId(event.target.value)}
                  className="bg-transparent text-sm font-semibold focus:outline-none"
                >
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-600 shadow-card"
            >
              {unreadNotifications.length ? <BellRing size={20} className="text-primary" /> : <Bell size={20} />}
              {unreadNotifications.length ? (
                <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-danger text-[10px] font-bold leading-5 text-white">
                  {unreadNotifications.length}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <SectionCard
          title="Schnelle Zusammenfassung"
          description="Sieh auf einen Blick, was heute wichtig ist."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-4 shadow-card">
              <p className="text-xs uppercase tracking-wide text-slate-400">Heute</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {tasks.filter((task) => task.assigneeId === currentUserId && task.dueDate === today && task.status === 'open').length}
              </p>
              <p className="text-sm text-slate-500">Aufgaben fällig</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-card">
              <p className="text-xs uppercase tracking-wide text-slate-400">Offen</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {tasks.filter((task) => task.assigneeId === currentUserId && task.status === 'open').length}
              </p>
              <p className="text-sm text-slate-500">Dir zugewiesen</p>
            </div>
            <div className="rounded-2xl bg-white p-4 shadow-card">
              <p className="text-xs uppercase tracking-wide text-slate-400">Familie</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{tasks.filter((task) => task.status === 'open').length}</p>
              <p className="text-sm text-slate-500">Offene Aufgaben gesamt</p>
            </div>
          </div>
        </SectionCard>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar size={16} />
            <span>
              {new Intl.DateTimeFormat('de-DE', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              }).format(new Date())}
            </span>
          </div>
          <button
            type="button"
            onClick={() => openTaskModal(null)}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-card transition hover:bg-primary/90"
          >
            <Plus size={18} /> Aufgabe hinzufügen
          </button>
        </div>

        {activeTab === 'notifications' ? (
          <SectionCard
            title="Mitteilungen"
            description="Bleibe über neue Aufgaben und Erinnerungen informiert."
          >
            <ul className="flex flex-col gap-3">
              {notifications.filter((notification) => notification.forUserId === currentUserId).length ? (
                notifications
                  .filter((notification) => notification.forUserId === currentUserId)
                  .map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onToggleRead={toggleNotificationRead}
                    />
                  ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                  Keine Nachrichten. Alles erledigt!
                </div>
              )}
            </ul>
          </SectionCard>
        ) : null}

        {activeTab === 'settings' ? (
          <>
            <SectionCard
              title="Familienbereiche"
              description="Organisiere deine Lebensbereiche und passe Farben & Icons an."
              actions={
                <button
                  type="button"
                  onClick={startCreateArea}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-card"
                >
                  <Plus size={16} /> Bereich hinzufügen
                </button>
              }
            >
              <div className="grid gap-3 md:grid-cols-2">
                {areas.map((area) => {
                  const Icon = iconLibrary[area.icon] ?? Circle
                  return (
                    <div
                      key={area.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ backgroundColor: area.color }}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{area.name}</p>
                          {area.isDefault ? (
                            <p className="text-xs text-slate-400">Standardbereich</p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditArea(area)}
                          className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteArea(area)}
                          className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-danger/10 hover:text-danger"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </SectionCard>

            <SectionCard
              title="Familienmitglieder"
              description="Verwalte, wer Aufgaben erhält und passe Avatare an."
              actions={
                <button
                  type="button"
                  onClick={startCreateMember}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-card"
                >
                  <Plus size={16} /> Mitglied hinzufügen
                </button>
              }
            >
              <div className="grid gap-3 md:grid-cols-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-lg">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{member.name}</p>
                        {member.isDefault ? (
                          <p className="text-xs text-slate-400">Standardmitglied</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEditMember(member)}
                        className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-primary/10 hover:text-primary"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMember(member)}
                        className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Familie verbinden"
              description="Teile den Zugang mit einem QR-Code oder dem Familiencode."
              actions={
                <button
                  type="button"
                  onClick={handleQRCodeGeneration}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-card"
                >
                  <QrCode size={16} /> QR-Code erzeugen
                </button>
              }
            >
              {qrData ? (
                <QRPreview code={qrData} />
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                  Noch kein Code generiert. Klicke auf „QR-Code erzeugen“.
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Push-Benachrichtigungen"
              description="Demo-Konfiguration für zukünftige native Push-Nachrichten."
            >
              <div className="rounded-2xl bg-white p-6 shadow-card">
                <p className="text-sm text-slate-600">
                  Aktiviere Push-Benachrichtigungen, um auch offline erinnert zu werden. In dieser Demo
                  simulieren wir die Aktivierung. Die finale Version nutzt den Browser-Push-Manager.
                </p>
                <button
                  type="button"
                  onClick={() => alert('Push-Benachrichtigungen werden in der Demo simuliert. Integration mit dem Push-API folgt im Livebetrieb.')}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-card"
                >
                  <BellDot size={16} /> Push vorbereiten
                </button>
              </div>
            </SectionCard>
          </>
        ) : null}

        {activeTab !== 'notifications' && activeTab !== 'settings' ? (
          <SectionCard
            title={
              activeTab === 'today'
                ? 'Deine Aufgaben für heute'
                : activeTab === 'week'
                ? 'Wochenübersicht'
                : activeTab === 'family'
                ? 'Familienboard'
                : 'Alle Aufgaben'
            }
            description={
              activeTab === 'today'
                ? 'Alle offenen Aufgaben, die heute für dich anstehen.'
                : activeTab === 'week'
                ? 'Planung der kommenden Woche – gemeinsam fokussiert bleiben.'
                : activeTab === 'family'
                ? 'Alle Aufgaben deiner Familie, gruppiert nach Bereich.'
                : 'Komplette Aufgabenhistorie der Familie.'
            }
          >
            {taskSections ? (
              <div className="flex flex-col gap-4">
                {taskSections.map(({ area, tasks: sectionTasks }) => {
                  const key = area?.id ?? 'other'
                  const SectionIcon = iconLibrary[area?.icon] ?? Circle
                  const isExpanded = expandedTaskSections[key] ?? true
                  return (
                    <div key={key} className="rounded-3xl border border-slate-100 bg-white p-4 shadow-card">
                      <button
                        type="button"
                        onClick={() => toggleSection(key)}
                        className="mb-4 flex w-full items-center justify-between text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                            style={{ backgroundColor: area?.color ?? '#cbd5f5' }}
                          >
                            <SectionIcon size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{area?.name ?? 'Weitere'}</p>
                            <p className="text-xs text-slate-500">{sectionTasks.length} Aufgaben</p>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      {isExpanded ? <div className="space-y-3">{renderTaskList(sectionTasks)}</div> : null}
                    </div>
                  )
                })}
              </div>
            ) : (
              renderTaskList(filteredTasks)
            )}
          </SectionCard>
        ) : null}
      </main>

      <TabsBar
        items={navItems}
        active={activeTab}
        onChange={setActiveTab}
        notificationCount={unreadNotifications.length}
      />

      <FloatingMicButton
        onClick={startSpeechRecognition}
        disabled={!speechSupported}
        isListening={isListening}
      />

      <Modal isOpen={taskModalOpen} onClose={closeTaskModal} title="Aufgabe festlegen">
        <form className="space-y-4" onSubmit={handleTaskSubmit}>
          <input type="hidden" name="id" defaultValue={editingTask?.id ?? ''} />
          <Field label="Titel" htmlFor="title">
            <input
              id="title"
              name="title"
              defaultValue={editingTask?.title ?? speechDraft ?? ''}
              placeholder="Was soll erledigt werden?"
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Bereich" htmlFor="area">
              <select
                id="area"
                name="area"
                defaultValue={editingTask?.areaId ?? areas[0]?.id}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
              >
                {areas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Zuständig" htmlFor="assignee">
              <select
                id="assignee"
                name="assignee"
                defaultValue={editingTask?.assigneeId ?? currentUserId}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Fälligkeitsdatum" htmlFor="dueDate">
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={editingTask?.dueDate ?? today}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
            </Field>
            <Field label="Priorität" htmlFor="priority">
              <select
                id="priority"
                name="priority"
                defaultValue={editingTask?.priority ?? 'normal'}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Status" htmlFor="status">
            <select
              id="status"
              name="status"
              defaultValue={editingTask?.status ?? 'open'}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
            >
              <option value="open">Offen</option>
              <option value="done">Erledigt</option>
            </select>
          </Field>
          {!speechSupported ? <DemoSpeechSuggestions onSelect={handleSpeechDemo} /> : null}
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={closeTaskModal}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-primary/90"
            >
              Speichern
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={areaModalOpen} onClose={closeAreaModal} title="Bereich verwalten">
        <form id="area-form" className="space-y-4" onSubmit={handleAreaSubmit}>
          <Field label="Bezeichnung" htmlFor="area-name">
            <input
              id="area-name"
              name="name"
              value={areaDraft.name}
              onChange={(event) => setAreaDraft((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Bereichsname"
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </Field>
          <Field label="Farbe" htmlFor="area-color">
            <div className="flex flex-wrap gap-2">
              {colorChoices.map((color) => (
                <label key={color} className="relative">
                  <input
                    type="radio"
                    name="color"
                    value={color}
                    checked={areaDraft.color === color}
                    onChange={() => setAreaDraft((prev) => ({ ...prev, color }))}
                    className="peer sr-only"
                  />
                  <span
                    className="block h-10 w-10 cursor-pointer rounded-full border-2 border-transparent transition peer-checked:border-slate-900"
                    style={{ backgroundColor: color }}
                  />
                </label>
              ))}
            </div>
          </Field>
          <Field label="Icon" htmlFor="area-icon">
            <select
              id="area-icon"
              name="icon"
              value={areaDraft.icon}
              onChange={(event) => setAreaDraft((prev) => ({ ...prev, icon: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
            >
              {iconChoices.map((icon) => (
                <option key={icon.value} value={icon.value}>
                  {icon.label}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeAreaModal}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-primary/90"
            >
              Speichern
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={memberModalOpen} onClose={closeMemberModal} title="Mitglied verwalten">
        <form id="member-form" className="space-y-4" onSubmit={handleMemberSubmit}>
          <Field label="Name" htmlFor="member-name">
            <input
              id="member-name"
              name="name"
              value={memberDraft.name}
              onChange={(event) => setMemberDraft((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Name"
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </Field>
          <Field label="Avatar Emoji" htmlFor="member-avatar">
            <select
              id="member-avatar"
              name="avatar"
              value={memberDraft.avatar}
              onChange={(event) => setMemberDraft((prev) => ({ ...prev, avatar: event.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none"
            >
              {emojiChoices.map((emoji) => (
                <option key={emoji} value={emoji}>
                  {emoji}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeMemberModal}
              className="rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-primary/90"
            >
              Speichern
            </button>
          </div>
        </form>
      </Modal>

      {!speechSupported ? (
        <div className="fixed bottom-32 left-1/2 z-30 w-[calc(100%-3rem)] max-w-md -translate-x-1/2 rounded-3xl bg-white p-4 text-sm text-slate-600 shadow-2xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-warning" size={20} />
            <div>
              <p className="font-semibold text-slate-900">Spracheingabe Demo-Modus aktiv</p>
              <p>Dein Browser unterstützt keine native Web Speech API. Nutze die Beispiele zum Testen.</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}