import { useState, useRef, useEffect } from 'react'
import { Edit3, AlertCircle, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { ALL_CATEGORIES, getCategoryMeta } from '../../domain/categories'
import { formatAmount } from '../../domain/money'

export default function EditTxSheet({ tx, onSubmit, onClose }) {
  const [amount, setAmount] = useState(String(tx.amount))
  const [category, setCategory] = useState(tx.category)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [note, setNote] = useState(tx.note || '')
  const [date, setDate] = useState(tx.date || new Date().toISOString().split('T')[0])
  const [errors, setErrors] = useState({})
  const amountRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    setTimeout(() => amountRef.current?.focus(), 300)
  }, [])

  // Close dropdown when tapping outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('pointerdown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick)
    }
  }, [isDropdownOpen])

  const availableCategories = ALL_CATEGORIES.filter((c) =>
    tx.type === 'income' || tx.type === 'salary' ? c.type === 'income' : c.type === 'expense'
  )

  const validate = () => {
    const e = {}
    const amt = Number(amount)
    if (!amount || isNaN(amt) || amt <= 0) {
      e.amount = 'Enter a valid amount greater than 0'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    if (validate()) {
      onSubmit(tx.id, {
        amount: Number(amount),
        category,
        note: note.trim(),
        date,
      })
    }
  }

  const currentCategoryMeta = getCategoryMeta(category)
  const CurrentIcon = currentCategoryMeta.icon

  return (
    <div className="bottom-sheet active">
      <div className="sheet-handle" />
      <div className="sheet-title">
        <Edit3 size={24} />
        Edit Transaction
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="edit-amount">Amount (₹)</label>
          <input
            ref={amountRef}
            id="edit-amount"
            className={`form-input ${errors.amount ? 'error' : ''}`}
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {errors.amount && (
            <div className="form-error"><AlertCircle size={14} /> {errors.amount}</div>
          )}
        </div>

        {availableCategories.length > 0 && (
          <div className="form-group" ref={dropdownRef} style={{ position: 'relative' }}>
            <label className="form-label" htmlFor="edit-category-btn">Category</label>
            
            <button
              type="button"
              id="edit-category-btn"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: `1.5px solid ${isDropdownOpen ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '15px',
                fontWeight: 600,
                boxShadow: isDropdownOpen ? '0 0 0 3px var(--accent-glow)' : 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `${currentCategoryMeta.color || '#6366F1'}1A`,
                    color: currentCategoryMeta.color || '#6366F1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CurrentIcon size={18} />
                </span>
                <span>{category}</span>
              </div>
              {isDropdownOpen ? <ChevronUp size={18} color="var(--accent)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
            </button>

            {isDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.15)',
                  maxHeight: '230px',
                  overflowY: 'auto',
                  zIndex: 150,
                  padding: '6px',
                  animation: 'slideIn 0.2s ease',
                }}
              >
                {availableCategories.map((c) => {
                  const meta = getCategoryMeta(c.name)
                  const Icon = meta.icon
                  const isSelected = category === c.name

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCategory(c.name)
                        setIsDropdownOpen(false)
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: isSelected ? 'var(--accent-light)' : 'transparent',
                        color: isSelected ? 'var(--accent-dark)' : 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: isSelected ? 700 : 500,
                        fontFamily: 'inherit',
                        textAlign: 'left',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: `${meta.color || '#6366F1'}1A`,
                            color: meta.color || '#6366F1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={16} />
                        </span>
                        <span>{c.name}</span>
                      </div>
                      {isSelected && <Check size={16} color="var(--accent)" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="edit-note">Note / Description</label>
          <input
            id="edit-note"
            className="form-input"
            type="text"
            placeholder="Description"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="edit-date">Date</label>
          <input
            id="edit-date"
            className="form-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <button className="btn-submit indigo" type="submit">
          Save Changes
        </button>
      </form>
    </div>
  )
}
