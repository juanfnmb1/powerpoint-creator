import { useState, useRef, useCallback, useEffect } from 'react'
import pptxgen from 'pptxgenjs'
import html2canvas from 'html2canvas'
import './App.css'

let nextId = 8

const defaultSlides = [
  {
    id: 1,
    tag: 'Introduction',
    title: 'My',
    titleAccent: 'Family',
    subtitle: 'A celebration of the people who make life beautiful',
    details: '',
    quote: 'Family is not an important thing. It\'s everything.',
    icon: 'favorite',
    color: 'primary',
    bgColor: '',
    borderColor: '#555555',
    imageShape: 'rectangle',
    images: [null, null],
    layout: 'intro',
  },
  {
    id: 2,
    tag: 'About Me',
    title: 'My',
    titleAccent: 'Name',
    subtitle: 'The person behind this presentation',
    details: 'A little about who I am, what I love, and what makes me, me.',
    quote: '',
    icon: 'person',
    color: 'secondary',
    bgColor: '',
    borderColor: '#555555',
    imageShape: 'rectangle',
    images: [null, null, null],
    layout: 'portrait',
  },
  {
    id: 3,
    tag: 'With Gratitude',
    title: 'My Mom',
    titleAccent: '& Dad',
    subtitle: 'The ones who raised me and shaped who I am today',
    details: 'Thank you for your endless love, guidance, and support throughout my life. Everything I am, I owe to you.',
    quote: '',
    icon: 'diversity_1',
    color: 'tertiary',
    bgColor: '',
    borderColor: '#555555',
    imageShape: 'rectangle',
    images: [null, null],
    layout: 'overlap',
  },
  {
    id: 4,
    tag: 'My Love',
    title: 'My',
    titleAccent: 'Husband',
    subtitle: 'My partner in everything and my greatest adventure',
    details: 'Together we built a home full of love and laughter. You are my rock and my best friend.',
    quote: '',
    icon: 'favorite',
    color: 'primary',
    bgColor: '',
    borderColor: '#555555',
    imageShape: 'rectangle',
    images: [null],
    layout: 'hero',
  },
  {
    id: 5,
    tag: 'Best Friend',
    title: 'Our',
    titleAccent: 'Dog',
    subtitle: 'Our furry best friend and the heart of our home',
    details: 'Endless paw prints, unconditional love, and the best cuddles. Life is better with you.',
    quote: '',
    icon: 'pets',
    color: 'secondary',
    bgColor: '',
    borderColor: '#555555',
    imageShape: 'rectangle',
    images: [null, null, null],
    layout: 'collage',
  },
  {
    id: 6,
    tag: 'Conclusion',
    title: 'With',
    titleAccent: 'Love',
    subtitle: 'Family is everything',
    details: 'Every moment spent together is a treasure. I am grateful for each and every one of you. This is for us.',
    quote: '',
    icon: 'heart_check',
    color: 'secondary',
    bgColor: '',
    borderColor: '#555555',
    imageShape: 'rectangle',
    images: [null, null],
    layout: 'conclusion',
  },
  {
    id: 7,
    tag: 'The End',
    title: 'Thank',
    titleAccent: 'You',
    subtitle: 'For watching and for being part of my story',
    details: '',
    quote: '',
    icon: 'volunteer_activism',
    color: 'primary',
    bgColor: '',
    borderColor: '#555555',
    imageShape: 'rectangle',
    images: [null],
    layout: 'thankyou',
  },
]

const COLOR_OPTIONS = [
  { key: 'primary', label: 'Rose', swatch: '#7f4e4f' },
  { key: 'secondary', label: 'Purple', swatch: '#63557a' },
  { key: 'tertiary', label: 'Green', swatch: '#446254' },
]

const BORDER_OPTIONS = [
  { key: '#555555', label: 'Gray' },
  { key: '#2e2f2f', label: 'Dark' },
  { key: '#7f4e4f', label: 'Rose' },
  { key: '#63557a', label: 'Purple' },
  { key: '#446254', label: 'Green' },
  { key: '#AEADAD', label: 'Light' },
]

const LAYOUT_OPTIONS = [
  { key: 'intro', label: 'Intro', icon: 'dashboard' },
  { key: 'portrait', label: 'Portrait', icon: 'person_pin' },
  { key: 'overlap', label: 'Stack', icon: 'filter_none' },
  { key: 'hero', label: 'Hero', icon: 'circle' },
  { key: 'collage', label: 'Collage', icon: 'grid_view' },
  { key: 'conclusion', label: 'Conclusion', icon: 'favorite' },
  { key: 'centered', label: 'Centered', icon: 'center_focus_strong' },
  { key: 'thankyou', label: 'Text Only', icon: 'waving_hand' },
]

// Map layout to how many image slots it needs
const LAYOUT_IMAGE_COUNT = {
  intro: 2,
  portrait: 3,
  overlap: 2,
  hero: 1,
  collage: 3,
  conclusion: 2,
  centered: 2,
  thankyou: 1,
}

// Inline editable text component — Enter adds a line break, Escape saves
function EditableText({ value, onChange, className, tag: Tag = 'span', placeholder = 'Click to edit...' }) {
  const ref = useRef(null)

  const handleBlur = () => {
    const text = ref.current?.innerText || ''
    if (text !== value) onChange(text)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      ref.current?.blur()
    }
  }

  return (
    <Tag
      ref={ref}
      className={`${className} editable`}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      data-placeholder={placeholder}
    >
      {value}
    </Tag>
  )
}

function ImageUploader({ image, onUpload, label }) {
  const inputRef = useRef(null)

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onUpload(ev.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="image-upload-slot" onClick={() => inputRef.current?.click()}>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} hidden />
      {image ? (
        <img src={image} alt={label} className="uploaded-img" />
      ) : (
        <div className="upload-placeholder">
          <span className="material-symbols-outlined">add_photo_alternate</span>
          <span className="upload-label">{label}</span>
        </div>
      )}
    </div>
  )
}

function SlideThumb({ slide, isActive, onClick, index }) {
  const colorMap = {
    primary: { bg: 'var(--primary-container)', text: 'var(--on-primary-container)' },
    secondary: { bg: 'var(--secondary-container)', text: 'var(--on-secondary-container)' },
    tertiary: { bg: 'var(--tertiary-container)', text: 'var(--on-tertiary-container)' },
  }
  const c = colorMap[slide.color]

  return (
    <div className={`slide-thumb ${isActive ? 'active' : ''}`} onClick={onClick}>
      <div className="thumb-num">{index + 1}</div>
      <div className="thumb-body" style={{ background: c.bg, color: c.text }}>
        <span className="material-symbols-outlined thumb-icon">{slide.icon}</span>
        <span className="thumb-title">{slide.title} <em>{slide.titleAccent}</em></span>
      </div>
    </div>
  )
}

function SlideIntro({ slide, onTextChange, onImageUpload }) {
  return (
    <div className="slide-canvas slide-intro">
      <div className="intro-left">
        <EditableText value={slide.tag} onChange={(v) => onTextChange('tag', v)} className={`slide-tag tag-${slide.color}`} tag="span" placeholder="Tag" />
        <h1 className="slide-heading">
          <EditableText value={slide.title} onChange={(v) => onTextChange('title', v)} className="heading-line" placeholder="Title" />
          <br />
          <EditableText value={slide.titleAccent} onChange={(v) => onTextChange('titleAccent', v)} className="serif-italic heading-line" placeholder="Accent" />
        </h1>
        <EditableText value={slide.subtitle} onChange={(v) => onTextChange('subtitle', v)} className="slide-subtitle" tag="p" placeholder="Subtitle..." />
        <div className="intro-decoration">
          <span className="material-symbols-outlined deco-icon">{slide.icon}</span>
        </div>
      </div>
      <div className="intro-right">
        <div className="bento-images intro-bento">
          <ImageUploader image={slide.images[0]} onUpload={(data) => onImageUpload(0, data)} label="Main Photo" />
          <ImageUploader image={slide.images[1]} onUpload={(data) => onImageUpload(1, data)} label="Second Photo" />
          <div className="bento-quote">
            <span className="material-symbols-outlined quote-bg-icon">format_quote</span>
            <EditableText value={slide.quote} onChange={(v) => onTextChange('quote', v)} className="quote-text" tag="p" placeholder="Add a quote..." />
          </div>
        </div>
      </div>
    </div>
  )
}

function SlidePortrait({ slide, onTextChange, onImageUpload }) {
  return (
    <div className="slide-canvas slide-portrait">
      <div className="portrait-left">
        <EditableText value={slide.tag} onChange={(v) => onTextChange('tag', v)} className={`slide-tag tag-${slide.color}`} tag="span" placeholder="Tag" />
        <h1 className="slide-heading">
          <EditableText value={slide.title} onChange={(v) => onTextChange('title', v)} className="heading-line" placeholder="Title" />
          <br />
          <EditableText value={slide.titleAccent} onChange={(v) => onTextChange('titleAccent', v)} className="serif-italic heading-line" placeholder="Accent" />
        </h1>
        <EditableText value={slide.subtitle} onChange={(v) => onTextChange('subtitle', v)} className="slide-subtitle" tag="p" placeholder="Subtitle..." />
        <EditableText value={slide.details} onChange={(v) => onTextChange('details', v)} className="slide-details" tag="p" placeholder="Add details..." />
      </div>
      <div className="portrait-right">
        <div className="portrait-accents">
          <div className="portrait-accent-slot">
            <ImageUploader image={slide.images[1]} onUpload={(data) => onImageUpload(1, data)} label="Photo 1" />
          </div>
          <div className="portrait-accent-slot">
            <ImageUploader image={slide.images[2]} onUpload={(data) => onImageUpload(2, data)} label="Photo 2" />
          </div>
        </div>
        <div className="portrait-main">
          <ImageUploader image={slide.images[0]} onUpload={(data) => onImageUpload(0, data)} label="Main Photo" />
        </div>
      </div>
    </div>
  )
}

function SlideOverlap({ slide, onTextChange, onImageUpload }) {
  return (
    <div className="slide-canvas slide-overlap">
      <div className="overlap-left">
        <EditableText value={slide.tag} onChange={(v) => onTextChange('tag', v)} className={`slide-tag tag-${slide.color}`} tag="span" placeholder="Tag" />
        <h1 className="slide-heading">
          <EditableText value={slide.title} onChange={(v) => onTextChange('title', v)} className="heading-line" placeholder="Title" />
          <br />
          <EditableText value={slide.titleAccent} onChange={(v) => onTextChange('titleAccent', v)} className="serif-italic heading-line" placeholder="Accent" />
        </h1>
        <EditableText value={slide.subtitle} onChange={(v) => onTextChange('subtitle', v)} className="slide-subtitle" tag="p" placeholder="Subtitle..." />
        <EditableText value={slide.details} onChange={(v) => onTextChange('details', v)} className="slide-details" tag="p" placeholder="Add details..." />
        <div className="content-icon-row">
          <div className={`icon-circle icon-${slide.color}`}>
            <span className="material-symbols-outlined">{slide.icon}</span>
          </div>
        </div>
      </div>
      <div className="overlap-right">
        <div className="overlap-stack">
          <div className="overlap-card overlap-back">
            <ImageUploader image={slide.images[1]} onUpload={(data) => onImageUpload(1, data)} label="Photo 2" />
          </div>
          <div className="overlap-card overlap-front">
            <ImageUploader image={slide.images[0]} onUpload={(data) => onImageUpload(0, data)} label="Photo 1" />
          </div>
        </div>
      </div>
    </div>
  )
}

function SlideHero({ slide, onTextChange, onImageUpload }) {
  return (
    <div className="slide-canvas slide-hero">
      <div className="hero-left">
        <EditableText value={slide.tag} onChange={(v) => onTextChange('tag', v)} className={`slide-tag tag-${slide.color}`} tag="span" placeholder="Tag" />
        <h1 className="slide-heading">
          <EditableText value={slide.title} onChange={(v) => onTextChange('title', v)} className="heading-line" placeholder="Title" />
          <br />
          <EditableText value={slide.titleAccent} onChange={(v) => onTextChange('titleAccent', v)} className="serif-italic heading-line" placeholder="Accent" />
        </h1>
        <EditableText value={slide.subtitle} onChange={(v) => onTextChange('subtitle', v)} className="slide-subtitle" tag="p" placeholder="Subtitle..." />
        <EditableText value={slide.details} onChange={(v) => onTextChange('details', v)} className="slide-details" tag="p" placeholder="Add details..." />
        <div className="content-icon-row">
          <div className={`icon-circle icon-${slide.color}`}>
            <span className="material-symbols-outlined">{slide.icon}</span>
          </div>
        </div>
      </div>
      <div className="hero-right">
        <div className="hero-bubble">
          <ImageUploader image={slide.images[0]} onUpload={(data) => onImageUpload(0, data)} label="Photo" />
        </div>
      </div>
    </div>
  )
}

function SlideCollage({ slide, onTextChange, onImageUpload }) {
  return (
    <div className="slide-canvas slide-collage">
      <div className="collage-left">
        <EditableText value={slide.tag} onChange={(v) => onTextChange('tag', v)} className={`slide-tag tag-${slide.color}`} tag="span" placeholder="Tag" />
        <h1 className="slide-heading">
          <EditableText value={slide.title} onChange={(v) => onTextChange('title', v)} className="heading-line" placeholder="Title" />
          <br />
          <EditableText value={slide.titleAccent} onChange={(v) => onTextChange('titleAccent', v)} className="serif-italic heading-line" placeholder="Accent" />
        </h1>
        <EditableText value={slide.subtitle} onChange={(v) => onTextChange('subtitle', v)} className="slide-subtitle" tag="p" placeholder="Subtitle..." />
        <EditableText value={slide.details} onChange={(v) => onTextChange('details', v)} className="slide-details" tag="p" placeholder="Add details..." />
        <div className="content-icon-row">
          <div className={`icon-circle icon-${slide.color}`}>
            <span className="material-symbols-outlined">{slide.icon}</span>
          </div>
        </div>
      </div>
      <div className="collage-right">
        <div className="collage-grid">
          <div className="collage-tall">
            <ImageUploader image={slide.images[0]} onUpload={(data) => onImageUpload(0, data)} label="Photo 1" />
          </div>
          <div className="collage-top">
            <ImageUploader image={slide.images[1]} onUpload={(data) => onImageUpload(1, data)} label="Photo 2" />
          </div>
          <div className="collage-bottom">
            <ImageUploader image={slide.images[2]} onUpload={(data) => onImageUpload(2, data)} label="Photo 3" />
          </div>
        </div>
      </div>
    </div>
  )
}

function SlideConclusion({ slide, onTextChange, onImageUpload }) {
  return (
    <div className="slide-canvas slide-conclusion">
      <div className="conclusion-center">
        <EditableText value={slide.tag} onChange={(v) => onTextChange('tag', v)} className={`slide-tag tag-${slide.color}`} tag="span" placeholder="Tag" />
        <h1 className="slide-heading conclusion-heading">
          <EditableText value={slide.title} onChange={(v) => onTextChange('title', v)} className="heading-line" placeholder="Title" />
          {' '}
          <EditableText value={slide.titleAccent} onChange={(v) => onTextChange('titleAccent', v)} className="serif-italic heading-line" placeholder="Accent" />
        </h1>
        <EditableText value={slide.subtitle} onChange={(v) => onTextChange('subtitle', v)} className="slide-subtitle" tag="p" placeholder="Subtitle..." />
        <EditableText value={slide.details} onChange={(v) => onTextChange('details', v)} className="slide-details" tag="p" placeholder="Add details..." />
        <div className="conclusion-images">
          <div className="conclusion-circle">
            <ImageUploader image={slide.images[0]} onUpload={(data) => onImageUpload(0, data)} label="Family Photo" />
          </div>
          <div className="conclusion-circle">
            <ImageUploader image={slide.images[1]} onUpload={(data) => onImageUpload(1, data)} label="Favorite Memory" />
          </div>
        </div>
        <div className="conclusion-deco">
          <span className="material-symbols-outlined">{slide.icon}</span>
        </div>
      </div>
    </div>
  )
}

// Centered layout — text only, optional add-image button
function SlideCentered({ slide, onTextChange, onImageUpload }) {
  return (
    <div className="slide-canvas slide-centered">
      <div className="centered-inner">
        <EditableText value={slide.tag} onChange={(v) => onTextChange('tag', v)} className={`slide-tag tag-${slide.color}`} tag="span" placeholder="Tag" />
        <h1 className="slide-heading centered-heading">
          <EditableText value={slide.title} onChange={(v) => onTextChange('title', v)} className="heading-line" placeholder="Title" />
          {' '}
          <EditableText value={slide.titleAccent} onChange={(v) => onTextChange('titleAccent', v)} className="serif-italic heading-line" placeholder="Accent" />
        </h1>
        <EditableText value={slide.subtitle} onChange={(v) => onTextChange('subtitle', v)} className="slide-subtitle" tag="p" placeholder="Subtitle..." />
        <EditableText value={slide.details} onChange={(v) => onTextChange('details', v)} className="slide-details" tag="p" placeholder="Add details..." />

        <div className="centered-images">
          <ImageUploader image={slide.images[0]} onUpload={(data) => onImageUpload(0, data)} label="Photo 1" />
          <ImageUploader image={slide.images[1]} onUpload={(data) => onImageUpload(1, data)} label="Photo 2" />
        </div>

        <div className="conclusion-deco">
          <span className="material-symbols-outlined">{slide.icon}</span>
        </div>
      </div>
    </div>
  )
}

function UploadTextBtn({ onUpload }) {
  const ref = useRef(null)
  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => onUpload(ev.target.result)
    reader.readAsDataURL(file)
  }
  return (
    <button className="upload-text-btn" onClick={() => ref.current?.click()}>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} hidden />
      <span className="material-symbols-outlined" style={{fontSize: '16px'}}>add</span> Upload optional photo
    </button>
  )
}

// Text Only layout — centered text with one optional image
function SlideThankYou({ slide, onTextChange, onImageUpload, onRemoveImage, onToggleShape }) {
  const hasImage = slide.images[0]
  const isSquare = slide.imageShape === 'square'
  return (
    <div className="slide-canvas slide-centered">
      <div className="centered-inner">
        <EditableText value={slide.tag} onChange={(v) => onTextChange('tag', v)} className={`slide-tag tag-${slide.color}`} tag="span" placeholder="Tag" />
        <h1 className="slide-heading centered-heading">
          <EditableText value={slide.title} onChange={(v) => onTextChange('title', v)} className="heading-line" placeholder="Title" />
          {' '}
          <EditableText value={slide.titleAccent} onChange={(v) => onTextChange('titleAccent', v)} className="serif-italic heading-line" placeholder="Accent" />
        </h1>
        <EditableText value={slide.subtitle} onChange={(v) => onTextChange('subtitle', v)} className="slide-subtitle" tag="p" placeholder="Subtitle..." />
        <EditableText value={slide.details} onChange={(v) => onTextChange('details', v)} className="slide-details" tag="p" placeholder="Add details..." />
        {hasImage ? (
          <div className={`thankyou-photo ${isSquare ? 'shape-square' : 'shape-rect'}`}>
            <button className="photo-shape-toggle" onClick={onToggleShape} title="Toggle shape">
              <span className="material-symbols-outlined">{isSquare ? 'crop_landscape' : 'circle'}</span>
            </button>
            <ImageUploader image={slide.images[0]} onUpload={(data) => onImageUpload(0, data)} label="Photo" />
          </div>
        ) : (
          <UploadTextBtn onUpload={(data) => onImageUpload(0, data)} />
        )}
        <div className="conclusion-deco">
          <span className="material-symbols-outlined">{slide.icon}</span>
        </div>
      </div>
    </div>
  )
}

function SlideToolbar({ slide, onChangeColor, onChangeBorder, onChangeBg, onChangeLayout, onDuplicate, onDelete, slideCount }) {
  const bgRef = useRef(null)

  return (
    <div className="slide-toolbar">
      <div className="toolbar-group">
        <span className="toolbar-label">Theme</span>
        {COLOR_OPTIONS.map(c => (
          <button
            key={c.key}
            className={`color-swatch ${slide.color === c.key ? 'active' : ''}`}
            style={{ background: c.swatch }}
            onClick={() => onChangeColor(c.key)}
            title={c.label}
          />
        ))}
      </div>

      <div className="toolbar-group">
        <span className="toolbar-label">Border</span>
        {BORDER_OPTIONS.map(b => (
          <button
            key={b.key}
            className={`color-swatch border-swatch ${slide.borderColor === b.key ? 'active' : ''}`}
            style={{ background: b.key }}
            onClick={() => onChangeBorder(b.key)}
            title={b.label}
          />
        ))}
      </div>

      <div className="toolbar-group">
        <span className="toolbar-label">Background</span>
        <button className="toolbar-btn bg-picker-btn" onClick={() => bgRef.current?.click()}>
          <span className="bg-preview" style={{ background: slide.bgColor || 'var(--surface-container-low)' }} />
          <span className="material-symbols-outlined">palette</span>
        </button>
        <input
          ref={bgRef}
          type="color"
          value={slide.bgColor || '#f2f0f0'}
          onChange={(e) => onChangeBg(e.target.value)}
          className="hidden-color-input"
        />
        {slide.bgColor && (
          <button className="toolbar-btn" onClick={() => onChangeBg('')} title="Reset background">
            <span className="material-symbols-outlined">restart_alt</span>
          </button>
        )}
      </div>

      <div className="toolbar-group">
        <span className="toolbar-label">Layout</span>
        <select
          className="layout-select"
          value={slide.layout}
          onChange={(e) => onChangeLayout(e.target.value)}
        >
          {LAYOUT_OPTIONS.map(l => (
            <option key={l.key} value={l.key}>{l.label}</option>
          ))}
        </select>
      </div>

      <div className="toolbar-group toolbar-actions">
        <button className="toolbar-btn" onClick={onDuplicate} title="Duplicate slide">
          <span className="material-symbols-outlined">content_copy</span>
        </button>
        {slideCount > 1 && (
          <button className="toolbar-btn toolbar-delete" onClick={onDelete} title="Delete slide">
            <span className="material-symbols-outlined">delete</span>
          </button>
        )}
      </div>
    </div>
  )
}

function SlideView({ slide, onTextChange, onImageUpload, onRemoveImage, onToggleShape }) {
  const props = { slide, onTextChange, onImageUpload, onRemoveImage, onToggleShape }
  const style = {
    ...(slide.bgColor ? { '--slide-bg': slide.bgColor } : {}),
    '--border-color': slide.borderColor || '#555555',
  }
  let content
  switch (slide.layout) {
    case 'intro':      content = <SlideIntro {...props} />; break
    case 'portrait':   content = <SlidePortrait {...props} />; break
    case 'overlap':    content = <SlideOverlap {...props} />; break
    case 'hero':       content = <SlideHero {...props} />; break
    case 'collage':    content = <SlideCollage {...props} />; break
    case 'conclusion': content = <SlideConclusion {...props} />; break
    case 'centered':   content = <SlideCentered {...props} />; break
    case 'thankyou':   content = <SlideThankYou {...props} onRemoveImage={props.onRemoveImage} onToggleShape={props.onToggleShape} />; break
    default:           content = <SlideIntro {...props} />; break
  }
  return <div className="slide-bg-wrapper" style={style}>{content}</div>
}

// IndexedDB helpers for storing large image data
const DB_STORE = 'images'

const DB_NAME = 'pptx-creator'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function saveImagesToDB(slides) {
  try {
    const db = await openDB()
    const tx = db.transaction(DB_STORE, 'readwrite')
    const store = tx.objectStore(DB_STORE)
    // Store all images keyed by "slideId-imageIndex"
    for (const slide of slides) {
      slide.images.forEach((img, i) => {
        const key = `${slide.id}-${i}`
        if (img) {
          store.put(img, key)
        } else {
          store.delete(key)
        }
      })
    }
    db.close()
  } catch { /* ignore */ }
}

async function loadImagesFromDB(slides) {
  try {
    const db = await openDB()
    const tx = db.transaction(DB_STORE, 'readonly')
    const store = tx.objectStore(DB_STORE)
    const updated = await Promise.all(slides.map(async (slide) => {
      const images = await Promise.all(slide.images.map((_, i) => {
        return new Promise((resolve) => {
          const req = store.get(`${slide.id}-${i}`)
          req.onsuccess = () => resolve(req.result || null)
          req.onerror = () => resolve(null)
        })
      }))
      return { ...slide, images }
    }))
    db.close()
    return updated
  } catch { return slides }
}

function loadSavedSlides() {
  try {
    const saved = localStorage.getItem('pptx-slides')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        const maxId = Math.max(...parsed.map(s => s.id))
        if (maxId >= nextId) nextId = maxId + 1
        // Replace __IMG__ placeholders with null — real images loaded from IndexedDB
        return restoreImagePlaceholders(parsed)
      }
    }
  } catch { /* ignore */ }
  return defaultSlides
}

// Strip images before saving to localStorage (they go to IndexedDB)
function stripImages(slides) {
  return slides.map(s => ({ ...s, images: s.images.map(img => img ? '__IMG__' : null) }))
}

function restoreImagePlaceholders(slides) {
  return slides.map(s => ({ ...s, images: s.images.map(img => img === '__IMG__' ? null : img) }))
}

export default function App() {
  const [current, setCurrent] = useState(() => {
    try { return Number(localStorage.getItem('pptx-current')) || 0 } catch { return 0 }
  })
  const [slides, setSlides] = useState(loadSavedSlides)
  const [presentationName, setPresentationName] = useState(() => {
    try { return localStorage.getItem('pptx-name') || 'My Presentation' } catch { return 'My Presentation' }
  })
  const [exporting, setExporting] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const exportRef = useRef(null)
  const wrapperRef = useRef(null)

  // Load images from IndexedDB on startup
  useEffect(() => {
    loadImagesFromDB(slides).then(withImages => {
      setSlides(withImages)
      setLoaded(true)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist text data to localStorage, images to IndexedDB
  useEffect(() => {
    if (!loaded) return
    localStorage.setItem('pptx-slides', JSON.stringify(stripImages(slides)))
    saveImagesToDB(slides)
  }, [slides, loaded])

  useEffect(() => {
    localStorage.setItem('pptx-current', String(current))
  }, [current])

  useEffect(() => {
    localStorage.setItem('pptx-name', presentationName)
  }, [presentationName])

  // Compute scale for mobile — slide renders at 960px, zoom to fit
  useEffect(() => {
    const updateScale = () => {
      const el = wrapperRef.current
      if (!el) return
      const containerWidth = el.clientWidth
      if (containerWidth < 960) {
        el.style.setProperty('--slide-scale', (containerWidth / 960).toFixed(4))
      } else {
        el.style.removeProperty('--slide-scale')
      }
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [current])

  const goPrev = () => setCurrent(i => Math.max(0, i - 1))
  const goNext = () => setCurrent(i => Math.min(slides.length - 1, i + 1))

  const handleImageUpload = (slideIndex, imageIndex, dataUrl) => {
    setSlides(prev => {
      const updated = [...prev]
      const images = [...updated[slideIndex].images]
      // If index is beyond current length, append
      if (imageIndex >= images.length) {
        images.push(dataUrl)
      } else {
        images[imageIndex] = dataUrl
      }
      updated[slideIndex] = { ...updated[slideIndex], images }
      return updated
    })
  }

  const handleTextChange = (slideIndex, field, value) => {
    setSlides(prev => {
      const updated = [...prev]
      updated[slideIndex] = { ...updated[slideIndex], [field]: value }
      return updated
    })
  }

  const handleChangeColor = (slideIndex, color) => {
    setSlides(prev => {
      const updated = [...prev]
      updated[slideIndex] = { ...updated[slideIndex], color }
      return updated
    })
  }

  const handleChangeBorder = (slideIndex, borderColor) => {
    setSlides(prev => {
      const updated = [...prev]
      updated[slideIndex] = { ...updated[slideIndex], borderColor }
      return updated
    })
  }

  const handleChangeShape = (slideIndex, imageShape) => {
    setSlides(prev => {
      const updated = [...prev]
      updated[slideIndex] = { ...updated[slideIndex], imageShape }
      return updated
    })
  }

  const handleRemoveImage = (slideIndex, imageIndex) => {
    setSlides(prev => {
      const updated = [...prev]
      const images = [...updated[slideIndex].images]
      images[imageIndex] = null
      updated[slideIndex] = { ...updated[slideIndex], images }
      return updated
    })
  }

  const handleChangeBg = (slideIndex, bgColor) => {
    setSlides(prev => {
      const updated = [...prev]
      updated[slideIndex] = { ...updated[slideIndex], bgColor }
      return updated
    })
  }

  const handleChangeLayout = (slideIndex, layout) => {
    setSlides(prev => {
      const updated = [...prev]
      const needed = LAYOUT_IMAGE_COUNT[layout] || 2
      const currentImages = updated[slideIndex].images
      // Resize images array to match new layout
      const images = Array.from({ length: needed }, (_, i) => currentImages[i] || null)
      updated[slideIndex] = { ...updated[slideIndex], layout, images }
      return updated
    })
  }

  const handleDuplicate = (slideIndex) => {
    setSlides(prev => {
      const source = prev[slideIndex]
      const dupe = { ...source, id: nextId++, images: [...source.images] }
      const updated = [...prev]
      updated.splice(slideIndex + 1, 0, dupe)
      return updated
    })
    setCurrent(slideIndex + 1)
  }

  const [showNewSlide, setShowNewSlide] = useState(false)

  const handleAddSlide = (layout) => {
    const needed = LAYOUT_IMAGE_COUNT[layout] || 2
    const newSlide = {
      id: nextId++,
      tag: 'New Slide',
      title: 'New',
      titleAccent: 'Slide',
      subtitle: 'Click to edit...',
      details: '',
      quote: '',
      icon: 'auto_awesome',
      color: 'primary',
      bgColor: '',
      borderColor: '#555555',
      imageShape: 'rectangle',
      images: Array(needed).fill(null),
      layout,
    }
    setSlides(prev => [...prev, newSlide])
    setCurrent(slides.length)
    setShowNewSlide(false)
  }

  const [showReset, setShowReset] = useState(false)

  const handleReset = () => {
    localStorage.removeItem('pptx-slides')
    localStorage.removeItem('pptx-current')
    localStorage.removeItem('pptx-name')
    indexedDB.deleteDatabase(DB_NAME)
    setSlides(defaultSlides)
    setCurrent(0)
    setPresentationName('My Presentation')
    setShowReset(false)
  }

  const handleDelete = (slideIndex) => {
    setSlides(prev => {
      const updated = prev.filter((_, i) => i !== slideIndex)
      return updated
    })
    setCurrent(i => Math.min(i, slides.length - 2))
  }

  const handleDownload = useCallback(async () => {
    setExporting(true)

    // Wait for React to render the offscreen slides
    await new Promise(r => setTimeout(r, 500))

    const pptx = new pptxgen()
    pptx.title = 'My Family'
    pptx.author = 'Presentation Creator'
    pptx.layout = 'LAYOUT_WIDE'

    const container = exportRef.current
    if (!container) { setExporting(false); return }

    const slideEls = container.querySelectorAll('.export-slide')

    for (const el of slideEls) {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f2f0f0',
        width: 1280,
        height: 720,
      })
      const imgData = canvas.toDataURL('image/png')
      const s = pptx.addSlide()
      s.addImage({ data: imgData, x: 0, y: 0, w: '100%', h: '100%' })
    }

    await pptx.writeFile({ fileName: `${presentationName.replace(/\s+/g, '_')}.pptx` })
    setExporting(false)
  }, [slides, presentationName])

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="material-symbols-outlined header-icon">slideshow</span>
          <input
            className="header-title-input"
            value={presentationName}
            onChange={(e) => setPresentationName(e.target.value)}
            placeholder="Presentation Name"
          />
        </div>
        <div className="header-right">
          <span className="slide-indicator">{current + 1} / {slides.length}</span>
          <button className="download-btn" onClick={handleDownload} disabled={exporting}>
            <span className="material-symbols-outlined">{exporting ? 'hourglass_top' : 'download'}</span>
            {exporting ? 'Exporting...' : 'Download PowerPoint'}
          </button>
        </div>
      </header>

      <div className="presenter">
        <div className="sidebar">
          {slides.map((slide, i) => (
            <SlideThumb
              key={slide.id}
              slide={slide}
              index={i}
              isActive={i === current}
              onClick={() => setCurrent(i)}
            />
          ))}
          <button className="add-slide-btn" onClick={() => setShowNewSlide(true)}>
            <span className="material-symbols-outlined">add</span>
            Add Slide
          </button>
        </div>

        <div className="main-area">
          <div className="slide-wrapper" ref={wrapperRef}>
            <SlideView
              slide={slides[current]}
              onTextChange={(field, value) => handleTextChange(current, field, value)}
              onImageUpload={(imgIdx, data) => handleImageUpload(current, imgIdx, data)}
              onRemoveImage={(imgIdx) => handleRemoveImage(current, imgIdx)}
              onToggleShape={() => handleChangeShape(current, slides[current].imageShape === 'square' ? 'rectangle' : 'square')}
            />
          </div>
          <SlideToolbar
            slide={slides[current]}
            slideCount={slides.length}
            onChangeColor={(c) => handleChangeColor(current, c)}
            onChangeBorder={(b) => handleChangeBorder(current, b)}
            onChangeBg={(bg) => handleChangeBg(current, bg)}
            onChangeLayout={(l) => handleChangeLayout(current, l)}
            onDuplicate={() => handleDuplicate(current)}
            onDelete={() => handleDelete(current)}
          />
          <div className="nav-controls">
            <button className="nav-btn" onClick={goPrev} disabled={current === 0}>
              <span className="material-symbols-outlined">arrow_back</span>
              Previous
            </button>
            <div className="nav-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`nav-dot ${i === current ? 'active' : ''}`}
                  onClick={() => setCurrent(i)}
                />
              ))}
            </div>
            <button className="nav-btn" onClick={goNext} disabled={current === slides.length - 1}>
              Next
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <button className="nav-btn reset-btn" onClick={() => setShowReset(true)}>
              <span className="material-symbols-outlined">restart_alt</span>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* New slide layout picker */}
      {showNewSlide && (
        <div className="modal-overlay" onClick={() => setShowNewSlide(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Choose a Layout</h3>
            <div className="layout-grid">
              {LAYOUT_OPTIONS.map(l => (
                <button
                  key={l.key}
                  className="layout-card"
                  onClick={() => handleAddSlide(l.key)}
                >
                  <span className="material-symbols-outlined layout-card-icon">{l.icon}</span>
                  <span className="layout-card-label">{l.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reset confirmation modal */}
      {showReset && (
        <div className="modal-overlay" onClick={() => setShowReset(false)}>
          <div className="modal reset-modal" onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined reset-modal-icon">warning</span>
            <h3 className="modal-title">Reset Presentation?</h3>
            <p className="reset-modal-text">This will clear all your slides, text, images, and settings. This action cannot be undone.</p>
            <div className="reset-modal-actions">
              <button className="reset-modal-cancel" onClick={() => setShowReset(false)}>Cancel</button>
              <button className="reset-modal-confirm" onClick={handleReset}>Yes, Reset Everything</button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden offscreen render of ALL slides for export */}
      {exporting && (
        <div ref={exportRef} className="export-container">
          {slides.map((slide, i) => (
            <div key={slide.id} className="export-slide">
              <SlideView
                slide={slide}
                onTextChange={() => {}}
                onImageUpload={() => {}}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
