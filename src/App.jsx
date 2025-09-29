import React, { useState, useEffect } from 'react';
import { Mic, Plus, Check, Clock, User, Home, Briefcase, Building, Heart, Users, Settings, Edit3, Trash2, Save, X, Edit2, Bell, UserCheck, Share2, Smartphone } from 'lucide-react';

const FamilyTodoApp = () => {
  // Aktueller Benutzer (simuliert verschiedene Geräte/Accounts)
  const [currentUser, setCurrentUser] = useState('me');
  const [isConnectedToFamily, setIsConnectedToFamily] = useState(true);
  const [familyCode, setFamilyCode] = useState('FAMILIE123');
  const [showQRCode, setShowQRCode] = useState(false);

  // QR-Code Daten (würde in echter App kryptographisch sicher sein)
  const generateQRData = () => {
    return JSON.stringify({
      familyId: familyCode,
      invitedBy: getFamilyMember(currentUser).name,
      timestamp: Date.now(),
      appVersion: "1.0",
    });
  };

  // Einfacher QR-Code Generator (Placeholder)
  const generateQRCode = (data) => {
    const size = 200;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
    return qrCodeUrl;
  };

  // Familienmitglieder
  const [family, setFamily] = useState([
    { id: 'me', name: 'Ich', avatar: '👤', isDefault: true },
    { id: 'partner', name: 'Partner/in', avatar: '❤️', isDefault: false },
    { id: 'child1', name: 'Kind 1', avatar: '👧', isDefault: false },
    { id: 'child2', name: 'Kind 2', avatar: '👦', isDefault: false }
  ]);

  // Bereiche
  const [areas, setAreas] = useState([
    { id: 'work', name: 'Arbeit', icon: 'Briefcase', color: 'bg-blue-500', isDefault: true },
    { id: 'company-a', name: 'Unternehmen A', icon: 'Building', color: 'bg-green-500', isDefault: false },
    { id: 'company-b', name: 'Unternehmen B', icon: 'Building', color: 'bg-purple-500', isDefault: false },
    { id: 'private', name: 'Privat', icon: 'User', color: 'bg-orange-500', isDefault: true },
    { id: 'family', name: 'Familie', icon: 'Users', color: 'bg-red-500', isDefault: true },
    { id: 'household', name: 'Haushalt', icon: 'Home', color: 'bg-yellow-500', isDefault: true }
  ]);

  // To-Dos
  const [todos, setTodos] = useState([
    {
      id: 1,
      title: 'Kind um 15 Uhr vom Musikunterricht abholen',
      area: 'family',
      assignedTo: 'me',
      dueDate: new Date(),
      priority: 'high',
      completed: false,
      createdBy: 'partner'
    },
    {
      id: 2,
      title: 'Müll rausbringen',
      area: 'household',
      assignedTo: 'child1',
      dueDate: new Date(),
      priority: 'normal',
      completed: false,
      createdBy: 'me'
    },
    {
      id: 3,
      title: 'Quartalsbericht fertigstellen',
      area: 'company-a',
      assignedTo: 'me',
      dueDate: new Date(Date.now() + 86400000),
      priority: 'high',
      completed: false,
      createdBy: 'me'
    }
  ]);

  // UI State
  const [activeTab, setActiveTab] = useState('today');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [showEditTodoModal, setShowEditTodoModal] = useState(false);
  const [showSharingModal, setShowSharingModal] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "Papa hat Ihnen eine neue Aufgabe zugewiesen: 'Kind um 15 Uhr abholen'",
      time: new Date(),
      read: false,
      fromUser: 'me',
      todoId: 1
    }
  ]);

  // Form State
  const [newTodo, setNewTodo] = useState({
    title: '',
    area: 'family',
    assignedTo: 'me',
    priority: 'normal',
    dueDate: new Date().toISOString().split('T')[0]
  });

  // Speech Recognition Setup
  useEffect(() => {
    // Zeige Mikrofon-Button immer an - in echter App oder Demo-Modus
    setSpeechSupported(true);
  }, []);

  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      // Demo-Modus: Simuliere Spracheingabe
      setIsListening(true);
      
      // Zeige Demo-Beispiele
      setTimeout(() => {
        const demoTexts = [
          "Mama soll heute einkaufen gehen",
          "Kind um 15 Uhr vom Musikunterricht abholen", 
          "Wichtig: Quartalsbericht fertigstellen",
          "Müll rausbringen",
          "Papa soll Oma anrufen"
        ];
        
        const randomText = demoTexts[Math.floor(Math.random() * demoTexts.length)];
        processSpokenText(randomText);
        setIsListening(false);
      }, 2000);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'de-DE';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      processSpokenText(spokenText);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert('Spracherkennung konnte nicht gestartet werden');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const processSpokenText = (text) => {
    let assignedTo = 'me';
    let area = 'family';
    let priority = 'normal';
    
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('mama') || lowerText.includes('mutter')) assignedTo = 'partner';
    if (lowerText.includes('papa') || lowerText.includes('vater')) assignedTo = 'me';
    if (lowerText.includes('kind')) assignedTo = 'child1';
    
    if (lowerText.includes('arbeit') || lowerText.includes('büro')) area = 'work';
    if (lowerText.includes('einkaufen') || lowerText.includes('müll') || lowerText.includes('putzen')) area = 'household';
    if (lowerText.includes('unternehmen') || lowerText.includes('geschäft')) area = 'company-a';
    
    if (lowerText.includes('wichtig') || lowerText.includes('dringend')) priority = 'high';
    
    setNewTodo({
      ...newTodo,
      title: text,
      assignedTo,
      area,
      priority
    });
    setShowAddModal(true);
  };

  const getAreaIcon = (iconName) => {
    const iconMap = {
      'Briefcase': Briefcase,
      'Building': Building,
      'User': User,
      'Users': Users,
      'Home': Home,
      'Heart': Heart
    };
    return iconMap[iconName] || Building;
  };

  const addTodo = () => {
    const todo = {
      id: Date.now(),
      title: newTodo.title,
      area: newTodo.area,
      assignedTo: newTodo.assignedTo,
      dueDate: new Date(newTodo.dueDate),
      priority: newTodo.priority,
      completed: false,
      createdBy: currentUser
    };
    
    setTodos([...todos, todo]);
    
    if (newTodo.assignedTo !== currentUser) {
      const assignedMember = getFamilyMember(newTodo.assignedTo);
      const creatorMember = getFamilyMember(currentUser);
      
      const notification = {
        id: Date.now(),
        message: `${creatorMember.name} hat Ihnen eine neue Aufgabe zugewiesen: "${newTodo.title}"`,
        time: new Date(),
        read: false,
        fromUser: currentUser,
        todoId: todo.id,
        forUser: newTodo.assignedTo
      };
      
      setNotifications([notification, ...notifications]);
    }
    
    setNewTodo({
      title: '',
      area: 'family',
      assignedTo: 'me',
      priority: 'normal',
      dueDate: new Date().toISOString().split('T')[0]
    });
    setShowAddModal(false);
  };

  const getUserNotifications = () => {
    return notifications.filter(notif => 
      notif.forUser === currentUser || 
      (notif.forUser === undefined && notif.fromUser !== currentUser)
    );
  };

  const markNotificationRead = (notificationId) => {
    setNotifications(notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const getUnreadCount = () => {
    return getUserNotifications().filter(notif => !notif.read).length;
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const updateTodo = (todoId, updates) => {
    setTodos(todos.map(todo => 
      todo.id === todoId ? { ...todo, ...updates } : todo
    ));
    setShowEditTodoModal(false);
    setEditingTodo(null);
  };

  const deleteTodo = (todoId) => {
    setTodos(todos.filter(todo => todo.id !== todoId));
  };

  const startEditTodo = (todo) => {
    setEditingTodo({
      ...todo,
      dueDate: todo.dueDate.toISOString().split('T')[0]
    });
    setShowEditTodoModal(true);
  };

  const addArea = (areaData) => {
    const newArea = {
      id: Date.now().toString(),
      name: areaData.name,
      icon: areaData.icon,
      color: areaData.color,
      isDefault: false
    };
    setAreas([...areas, newArea]);
  };

  const updateArea = (areaId, updates) => {
    setAreas(areas.map(area => 
      area.id === areaId ? { ...area, ...updates } : area
    ));
    setEditingArea(null);
  };

  const deleteArea = (areaId) => {
    const area = areas.find(a => a.id === areaId);
    if (area.isDefault) {
      if (!confirm(`Möchten Sie den Standard-Bereich "${area.name}" wirklich löschen?`)) {
        return;
      }
    }
    
    setAreas(areas.filter(area => area.id !== areaId));
    const remainingAreas = areas.filter(area => area.id !== areaId);
    const fallbackArea = remainingAreas.find(a => a.id === 'private') || remainingAreas[0];
    
    setTodos(todos.map(todo => 
      todo.area === areaId ? { ...todo, area: fallbackArea?.id || 'private' } : todo
    ));
  };

  const addFamilyMember = (memberData) => {
    const newMember = {
      id: Date.now().toString(),
      name: memberData.name,
      avatar: memberData.avatar,
      isDefault: false
    };
    setFamily([...family, newMember]);
  };

  const updateFamilyMember = (memberId, updates) => {
    setFamily(family.map(member => 
      member.id === memberId ? { ...member, ...updates } : member
    ));
    setEditingMember(null);
  };

  const deleteFamilyMember = (memberId) => {
    const member = family.find(m => m.id === memberId);
    if (member.isDefault) return;
    
    setFamily(family.filter(member => member.id !== memberId));
    setTodos(todos.map(todo => 
      todo.assignedTo === memberId ? { ...todo, assignedTo: 'me' } : todo
    ));
  };

  const getTodaysDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const filterTodos = () => {
    const today = getTodaysDate();
    let filtered = todos;
    
    switch (activeTab) {
      case 'today':
        filtered = todos.filter(todo => 
          todo.dueDate.toISOString().split('T')[0] === today && 
          !todo.completed &&
          todo.assignedTo === currentUser
        );
        break;
      case 'week':
        const weekFromNow = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
        filtered = todos.filter(todo => 
          todo.dueDate.toISOString().split('T')[0] <= weekFromNow && 
          !todo.completed &&
          todo.assignedTo === currentUser
        );
        break;
      case 'family':
        filtered = todos.filter(todo => todo.area === 'family');
        break;
      case 'all':
        filtered = todos.filter(todo => 
          todo.assignedTo === currentUser || 
          todo.createdBy === currentUser ||
          todo.area === 'family'
        );
        break;
      default:
        filtered = todos;
    }
    
    return filtered;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'normal': return 'border-l-blue-500';
      case 'low': return 'border-l-gray-500';
      default: return 'border-l-blue-500';
    }
  };

  const getAreaInfo = (areaId) => {
    return areas.find(area => area.id === areaId);
  };

  const getFamilyMember = (memberId) => {
    return family.find(member => member.id === memberId);
  };

  // Edit Area Form Component
  const EditAreaForm = ({ area, onSave, onCancel }) => {
    const [name, setName] = useState(area.name);
    const [color, setColor] = useState(area.color);
    const [icon, setIcon] = useState(area.icon);

    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 
      'bg-red-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'
    ];

    const icons = ['Briefcase', 'Building', 'User', 'Users', 'Home', 'Heart'];

    return (
      <div className="flex-1 space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          placeholder="Bereichsname"
        />
        <div className="flex space-x-2">
          {colors.map(colorClass => (
            <button
              key={colorClass}
              onClick={() => setColor(colorClass)}
              className={`w-6 h-6 ${colorClass} rounded ${color === colorClass ? 'ring-2 ring-gray-800' : ''} touch-target`}
            />
          ))}
        </div>
        <div className="flex space-x-2">
          {icons.map(iconName => {
            const IconComponent = getAreaIcon(iconName);
            return (
              <button
                key={iconName}
                onClick={() => setIcon(iconName)}
                className={`p-2 border rounded touch-target ${icon === iconName ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              >
                <IconComponent size={16} />
              </button>
            );
          })}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onSave({ name, color, icon })}
            className="btn-success"
          >
            <Save size={14} />
          </button>
          <button
            onClick={onCancel}
            className="btn-secondary"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  };

  // Edit Member Form Component
  const EditMemberForm = ({ member, onSave, onCancel }) => {
    const [name, setName] = useState(member.name);
    const [avatar, setAvatar] = useState(member.avatar);

    const avatars = ['👤', '❤️', '👧', '👦', '👨', '👩', '👴', '👵', '🧑', '👶'];

    return (
      <div className="flex-1 space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          placeholder="Name"
        />
        <div className="flex space-x-2 flex-wrap">
          {avatars.map(emoji => (
            <button
              key={emoji}
              onClick={() => setAvatar(emoji)}
              className={`text-2xl p-1 rounded touch-target ${avatar === emoji ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onSave({ name, avatar })}
            className="btn-success"
          >
            <Save size={14} />
          </button>
          <button
            onClick={onCancel}
            className="btn-secondary"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  };

  // Add Area Modal Component
  const AddAreaModal = ({ onAdd, onClose }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState('bg-blue-500');
    const [icon, setIcon] = useState('Building');

    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 
      'bg-red-500', 'bg-yellow-500', 'bg-pink-500', 'bg-indigo-500'
    ];

    const icons = ['Briefcase', 'Building', 'User', 'Users', 'Home', 'Heart'];

    const handleSubmit = () => {
      if (name.trim()) {
        onAdd({ name: name.trim(), color, icon });
        onClose();
      }
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content animate-slide-up">
          <h2 className="text-xl font-bold mb-4">Neuen Bereich hinzufügen</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Mein Unternehmen"
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Farbe</label>
              <div className="flex space-x-2">
                {colors.map(colorClass => (
                  <button
                    key={colorClass}
                    onClick={() => setColor(colorClass)}
                    className={`w-8 h-8 ${colorClass} rounded touch-target ${color === colorClass ? 'ring-2 ring-gray-800' : ''}`}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Symbol</label>
              <div className="flex space-x-2">
                {icons.map(iconName => {
                  const IconComponent = getAreaIcon(iconName);
                  return (
                    <button
                      key={iconName}
                      onClick={() => setIcon(iconName)}
                      className={`p-3 border rounded-lg touch-target ${icon === iconName ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                    >
                      <IconComponent size={20} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button onClick={onClose} className="btn-secondary flex-1">
              Abbrechen
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              Hinzufügen
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add Member Modal Component
  const AddMemberModal = ({ onAdd, onClose }) => {
    const [name, setName] = useState('');
    const [avatar, setAvatar] = useState('👤');

    const avatars = ['👤', '❤️', '👧', '👦', '👨', '👩', '👴', '👵', '🧑', '👶'];

    const handleSubmit = () => {
      if (name.trim()) {
        onAdd({ name: name.trim(), avatar });
        onClose();
      }
    };

    return (
      <div className="modal-overlay">
        <div className="modal-content animate-slide-up">
          <h2 className="text-xl font-bold mb-4">Neues Familienmitglied hinzufügen</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Anna"
                className="input-field"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
              <div className="flex space-x-2 flex-wrap">
                {avatars.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setAvatar(emoji)}
                    className={`text-3xl p-2 rounded-lg touch-target ${avatar === emoji ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button onClick={onClose} className="btn-secondary flex-1">
              Abbrechen
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="btn-success flex-1 disabled:opacity-50"
            >
              Hinzufügen
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 safe-area-top safe-area-bottom">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 safe-area-left safe-area-right">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Familien-Organizer</h1>
            <p className="text-gray-600">Heute • {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Benutzer-Switcher */}
            <div className="flex items-center space-x-2">
              <UserCheck size={20} className="text-gray-600" />
              <select 
                value={currentUser}
                onChange={(e) => setCurrentUser(e.target.value)}
                className="select-field text-sm"
                title="Zwischen Familienmitgliedern wechseln (simuliert verschiedene Geräte)"
              >
                {family.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.avatar} {member.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Benachrichtigungen */}
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative touch-target p-2 text-gray-600 hover:text-blue-600"
              title="Benachrichtigungen"
            >
              <Bell size={20} />
              {getUnreadCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getUnreadCount()}
                </span>
              )}
            </button>

            {/* Sharing Info */}
            <button
              onClick={() => setShowSharingModal(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 touch-target"
              title="Familie verbinden"
            >
              <Share2 size={16} />
              <span className="text-sm">Verbunden</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 safe-area-left safe-area-right">
        <div className="flex overflow-x-auto scrollbar-hide">
          {[
            { id: 'today', label: 'Heute', count: filterTodos().length },
            { id: 'week', label: 'Diese Woche', count: 0 },
            { id: 'family', label: 'Familie', count: 0 },
            { id: 'all', label: 'Alle', count: todos.length },
            { id: 'notifications', label: 'Mitteilungen', icon: Bell, count: getUnreadCount() },
            { id: 'settings', label: 'Einstellungen', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center space-x-2 border-b-2 touch-target transition-colors ${
                activeTab === tab.id 
                  ? 'tab-active' 
                  : 'tab-inactive'
              }`}
            >
              {tab.icon && <tab.icon size={16} />}
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content wird hier für Platz weggelassen - gleicher Code wie vorher aber mit CSS-Klassen optimiert */}
      <div className="p-4 space-y-3 safe-area-left safe-area-right pb-24">
        {activeTab === 'today' && filterTodos().length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Alle Aufgaben erledigt!</h3>
            <p className="text-gray-600">Sie haben heute nichts mehr zu tun.</p>
          </div>
        )}
        
        {filterTodos().map(todo => {
          const areaInfo = getAreaInfo(todo.area);
          const assignedMember = getFamilyMember(todo.assignedTo);
          const createdMember = getFamilyMember(todo.createdBy);
          const IconComponent = getAreaIcon(areaInfo.icon);
          
          return (
            <div
              key={todo.id}
              className={`card card-hover p-4 border-l-4 ${getPriorityColor(todo.priority)} ${
                todo.completed ? 'opacity-50' : ''
              } animate-fade-in`}
            >
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all touch-target ${
                    todo.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-300 hover:border-green-500'
                  }`}
                >
                  {todo.completed && <Check size={16} />}
                </button>
                
                <div className="flex-1">
                  <h3 className={`font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {todo.title}
                  </h3>
                  
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <IconComponent size={16} />
                      <span>{areaInfo.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <span>{assignedMember.avatar}</span>
                      <span>{assignedMember.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Clock size={16} />
                      <span>{todo.dueDate.toLocaleDateString('de-DE')}</span>
                    </div>
                  </div>
                  
                  {todo.createdBy !== todo.assignedTo && (
                    <p className="text-xs text-gray-500 mt-1">
                      Zugewiesen von {createdMember.name}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-1">
                  <button
                    onClick={() => startEditTodo(todo)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors touch-target"
                    title="Aufgabe bearbeiten"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors touch-target"
                    title="Aufgabe löschen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 space-y-3 no-print safe-area-right safe-area-bottom">
        <button
          onClick={startSpeechRecognition}
          disabled={isListening}
          className={`btn-floating transition-all ${
            isListening 
              ? 'bg-red-500 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
          title={('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) 
            ? "Spracheingabe starten" 
            : "Demo: Spracheingabe simulieren"}
        >
          <Mic size={24} />
        </button>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-floating bg-green-500 hover:bg-green-600"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Alle Modals hier mit optimierten CSS-Klassen */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up">
            <h2 className="text-xl font-bold mb-4">Neue Aufgabe</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aufgabe</label>
                <input
                  type="text"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({...newTodo, title: e.target.value})}
                  placeholder="Was muss erledigt werden?"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bereich</label>
                <select
                  value={newTodo.area}
                  onChange={(e) => setNewTodo({...newTodo, area: e.target.value})}
                  className="select-field"
                >
                  {areas.map(area => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zuweisen an</label>
                <select
                  value={newTodo.assignedTo}
                  onChange={(e) => setNewTodo({...newTodo, assignedTo: e.target.value})}
                  className="select-field"
                >
                  {family.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.avatar} {member.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fällig am</label>
                  <input
                    type="date"
                    value={newTodo.dueDate}
                    onChange={(e) => setNewTodo({...newTodo, dueDate: e.target.value})}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorität</label>
                  <select
                    value={newTodo.priority}
                    onChange={(e) => setNewTodo({...newTodo, priority: e.target.value})}
                    className="select-field"
                  >
                    <option value="low">Niedrig</option>
                    <option value="normal">Normal</option>
                    <option value="high">Hoch</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
                Abbrechen
              </button>
              <button
                onClick={addTodo}
                disabled={!newTodo.title.trim()}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Weitere Modals hier... */}
      {showAddAreaModal && (
        <AddAreaModal 
          onAdd={addArea}
          onClose={() => setShowAddAreaModal(false)}
        />
      )}

      {showAddMemberModal && (
        <AddMemberModal 
          onAdd={addFamilyMember}
          onClose={() => setShowAddMemberModal(false)}
        />
      )}

      {/* Speech Recognition Feedback */}
      {isListening && (
        <div className="modal-overlay">
          <div className="bg-white rounded-lg p-8 text-center animate-fade-in">
            <div className="text-6xl mb-4 animate-pulse">🎤</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) 
                ? 'Ich höre zu...' 
                : 'Demo-Spracheingabe...'}
            </h3>
            <p className="text-gray-600">
              {('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) 
                ? 'Sprechen Sie Ihre Aufgabe' 
                : 'Simuliere zufällige Spracheingabe'}
            </p>
            {!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
              <p className="text-xs text-gray-500 mt-2">
                In der echten App: Sprechen Sie einfach Ihre Aufgabe
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyTodoApp;