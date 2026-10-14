import { useState, useRef, useEffect } from 'react'
import { Receipt, AlertCircle, ChevronDown, ChevronUp, Check } from 'lucide-react'
import { DEFAULT_SPEND_CATEGORIES, getCategoryMeta } from '../../domain/categories'
import { formatAmount } from '../../domain/money'

export default function SpentSheet({ onSubmit, onClose }) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(DEFAULT_SPEND_CATEGORIES[0])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [otherText, setOtherText] = useState('')
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

  const validate = () => {
    const e = {}
    const amt = Number(amount)
    if (!amount || isNaN(amt) || amt <= 0) e.amount = 'Enter a valid amount greater than 0'
    if (category === 'Other' && !otherText.trim()) e.other = 'Describe where you spent this'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    if (validate()) {
      onSubmit({
        amount: Number(amount),
        category,
        note: category === 'Other' ? otherText.trim() : otherText.trim() || category,
      })
    }
  }

  const currentCategoryMeta = getCategoryMeta(category)
  const CurrentIcon = currentCategoryMeta.icon

  return (
    <div className="bottom-sheet active">
      <div className="sheet-handle" />
      <div className="sheet-title">
        <Receipt size={24} />
        Record Spending
      </div>
      <form onSubmit={handleSubmit}>
        {/* Amount */}
        <div className="form-group">
          <label className="form-label" htmlFor="spent-amount">Amount (₹)</label>
          <input
            ref={amountRef}
            id="spent-amount"
            className={`form-input ${errors.amount ? 'error' : ''}`}
            type="number"
            inputMode="decimal"
            placeholder="e.g. 120"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {errors.amount && (
            <div className="form-error"><AlertCircle size={14} /> {errors.amount}</div>
          )}
        </div>

        {/* Custom Category Dropdown */}
        <div className="form-group" ref={dropdownRef} style={{ position: 'relative' }}>
          <label className="form-label" htmlFor="spent-category-btn">Category</label>
          
          {/* Custom Trigger Button */}
          <button
            type="button"
            id="spent-category-btn"
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

          {/* Dropdown Popover List */}
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
              {DEFAULT_SPEND_CATEGORIES.map((catName) => {
                const meta = getCategoryMeta(catName)
                const Icon = meta.icon
                const isSelected = category === catName

                return (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => {
                      setCategory(catName)
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
                      <span>{catName}</span>
                    </div>
                    {isSelected && <Check size={16} color="var(--accent)" />}
                  </button>
                )
              })}
            </div>
          )}

          {/* Quick Category Chips for 1-Tap Selection */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {DEFAULT_SPEND_CATEGORIES.slice(0, 5).map((quickCat) => {
              const isSelected = category === quickCat
              return (
                <button
                  key={quickCat}
                  type="button"
                  onClick={() => setCategory(quickCat)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                    background: isSelected ? 'var(--accent-light)' : 'var(--surface-alt)',
                    color: isSelected ? 'var(--accent-dark)' : 'var(--text-secondary)',
                    fontSize: '11px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {quickCat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Note / Description */}
        <div className="form-group" style={{ animation: 'slideIn 0.25s ease' }}>
          <label className="form-label" htmlFor="spent-other">
            {category === 'Other' ? 'Where did you spend this? *' : 'Note (optional)'}
          </label>
          <input
            id="spent-other"
            className={`form-input ${errors.other ? 'error' : ''}`}
            type="text"
            placeholder={category === 'Other' ? 'e.g. Auto rickshaw / Bus ticket' : 'e.g. Lunch with team'}
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
          />
          {errors.other && (
            <div className="form-error"><AlertCircle size={14} /> {errors.other}</div>
          )}
        </div>

        <button className="btn-submit red" type="submit">
          Spend ₹{amount && Number(amount) > 0 ? formatAmount(Number(amount)) : '0'}
        </button>
      </form>
    </div>
  )
}
