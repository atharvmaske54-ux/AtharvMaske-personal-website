class OptionWheel {
    constructor(container, options = {}) {
        this.container = container;
        
        // Defaults
        this.items = options.items || [];
        this.defaultSelected = options.defaultSelected || 0;
        this.onChange = options.onChange || null;
        this.onSelect = options.onSelect || null;
        this.textColor = options.textColor || '#a6a6a6';
        this.activeColor = options.activeColor || '#ffffff';
        this.side = options.side || 'right';
        this.fontSize = options.fontSize || 3;
        this.spacing = options.spacing || 1.4;
        this.curve = options.curve !== undefined ? options.curve : 1;
        this.tilt = options.tilt !== undefined ? options.tilt : 6;
        this.blur = options.blur !== undefined ? options.blur : 2;
        this.fade = options.fade !== undefined ? options.fade : 0.25;
        this.minOpacity = options.minOpacity !== undefined ? options.minOpacity : 0.05;
        this.smoothing = options.smoothing || 200;
        this.inset = options.inset || 80;
        this.loop = options.loop || false;
        this.draggable = options.draggable !== undefined ? options.draggable : true;

        // State
        this.pos = this.defaultSelected;
        this.target = this.defaultSelected;
        this.selectedIndex = this.defaultSelected;
        this.isDragging = false;
        
        this.lastTime = performance.now();
        this.rafId = null;
        this.wheelTimer = null;
        
        this.dragRef = null;
        this.dragMoved = false;
        
        this.itemElements = [];
        this.count = this.items.length;
        this.remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        this.rowH = Math.max(this.fontSize * this.spacing * this.remPx, 1);

        this.initDOM();
        this.bindEvents();
        
        // Dynamic resize handler for auto-layout responsiveness
        this.onResize = () => {
            this.remPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
            this.rowH = Math.max(this.fontSize * this.spacing * this.remPx, 1);
            this.runFrame(performance.now(), true);
        };
        window.addEventListener('resize', this.onResize);
        
        // Force an initial update to lay out properly
        this.runFrame(performance.now(), true);
    }

    initDOM() {
        this.container.classList.add('option-wheel');
        if (this.side === 'right') this.container.classList.add('option-wheel--right');
        
        this.container.style.setProperty('--ow-text-color', this.textColor);
        this.container.style.setProperty('--ow-active-color', this.activeColor);
        this.container.style.setProperty('--ow-font-size', `${this.fontSize}rem`);
        this.container.style.setProperty('--ow-inset', `${this.inset}px`);
        
        this.container.innerHTML = '';
        this.items.forEach((label, i) => {
            const el = document.createElement('div');
            el.className = 'option-wheel__item';
            if (i === this.selectedIndex) el.classList.add('option-wheel__item--selected');
            el.textContent = label;
            
            el.addEventListener('click', () => this.handleItemClick(i));
            
            this.container.appendChild(el);
            this.itemElements.push(el);
        });
    }

    applyTarget(value, snap) {
        let v = value;
        if (!this.loop) {
            v = Math.min(Math.max(v, 0), Math.max(this.count - 1, 0));
        }
        if (snap) v = Math.round(v);
        this.target = v;
        
        const idx = ((Math.round(v) % this.count) + this.count) % this.count;
        if (idx !== this.selectedIndex) {
            if(this.itemElements[this.selectedIndex]) {
                this.itemElements[this.selectedIndex].classList.remove('option-wheel__item--selected');
            }
            this.selectedIndex = idx;
            if(this.itemElements[this.selectedIndex]) {
                this.itemElements[this.selectedIndex].classList.add('option-wheel__item--selected');
            }
            if (this.onChange) this.onChange(idx, this.items[idx]);
        }
        this.startLoop();
    }

    runFrame(now, force = false) {
        const dt = Math.min((now - this.lastTime) / 1000, 0.05);
        this.lastTime = now;
        
        const tau = Math.max(this.smoothing, 1) / 1000;
        const k = 1 - Math.exp(-dt / tau);

        let next = this.pos + (this.target - this.pos) * k;
        const settled = Math.abs(this.target - next) < 0.001;
        if (settled) next = this.target;
        this.pos = next;

        const mirror = this.side === 'right' ? -1 : 1;
        const tiltRad = (this.tilt * Math.PI) / 180;
        const R = tiltRad > 0.0005 ? this.rowH / tiltRad : 0;
        
        for (let i = 0; i < this.count; i++) {
            const el = this.itemElements[i];
            let d = i - next;
            
            if (this.loop && this.count > 1) {
                d = ((d % this.count) + this.count) % this.count;
                if (d > this.count / 2) d -= this.count;
            }
            
            const dist = Math.abs(d);
            let x = 0;
            let y = d * this.rowH;
            let rot = 0;
            
            if (R > 0) {
                const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
                y = R * Math.sin(ang);
                x = -mirror * R * (1 - Math.cos(ang)) * this.curve;
                rot = (mirror * ang * 180) / Math.PI;
            }
            
            el.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg)`;
            el.style.opacity = String(Math.max(this.minOpacity, 1 - dist * this.fade));
            el.style.filter = this.blur > 0 ? `blur(${(dist * this.blur).toFixed(2)}px)` : 'none';
            el.style.setProperty('--ow-p', Math.max(0, 1 - Math.min(dist, 1)).toFixed(4));
        }

        if (settled && !force) {
            this.rafId = null;
        } else if (!settled) {
            this.rafId = requestAnimationFrame(this.runFrame.bind(this));
        }
    }

    startLoop() {
        if (this.rafId != null) return;
        this.lastTime = performance.now();
        this.rafId = requestAnimationFrame(this.runFrame.bind(this));
    }

    handleItemClick(index) {
        if (this.dragMoved) return;
        let d = index - (((this.target % this.count) + this.count) % this.count);
        if (this.loop && this.count > 1) {
            if (d > this.count / 2) d -= this.count;
            else if (d < -this.count / 2) d += this.count;
        }
        if (d === 0 && this.onSelect) {
            this.onSelect(index, this.items[index]);
        }
        this.applyTarget(this.target + d, true);
    }

    bindEvents() {
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
            const step = Math.max(-1, Math.min(1, delta / this.rowH));
            this.applyTarget(this.target + step, false);
            
            if (this.wheelTimer) clearTimeout(this.wheelTimer);
            this.wheelTimer = setTimeout(() => this.applyTarget(this.target, true), 140);
        }, { passive: false });

        if (this.draggable) {
            this.container.addEventListener('pointerdown', (e) => {
                this.dragRef = { y: e.clientY, start: this.target, id: e.pointerId };
                this.dragMoved = false;
                this.container.classList.add('option-wheel--dragging');
            });

            window.addEventListener('pointermove', (e) => {
                if (!this.dragRef) return;
                const dy = e.clientY - this.dragRef.y;
                if (!this.dragMoved && Math.abs(dy) > 4) {
                    this.dragMoved = true;
                    this.container.setPointerCapture(this.dragRef.id);
                }
                if (this.dragMoved) {
                    this.applyTarget(this.dragRef.start - dy / this.rowH, false);
                }
            });

            const endDrag = () => {
                if (!this.dragRef) return;
                this.dragRef = null;
                this.container.classList.remove('option-wheel--dragging');
                if (this.dragMoved) this.applyTarget(this.target, true);
            };

            window.addEventListener('pointerup', endDrag);
            window.addEventListener('pointercancel', endDrag);
        }

        window.addEventListener('keydown', (e) => {
            let delta = null;
            if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') delta = -1;
            else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') delta = 1;
            if (delta == null) return;
            e.preventDefault();
            this.applyTarget(Math.round(this.target) + delta, true);
        });
    }
}
