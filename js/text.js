// import html2canvas from 'html2canvas';
import { KEYS, checkIn } from './utils';
import { tr } from './translation';

export default class TextTool {
  constructor(main) {
    this.ctx = main.ctx;
    this.el = main.toolContainer;
    this.main = main;
    this.wrapper = main.wrapper;
    this.input = this.el.querySelector('.ptro-text-tool-input');
    this.inputWrapper = this.el.querySelector('.ptro-text-tool-input-wrapper');
    this.inputWrapper.style.display = 'none';
    this.setFontSize(main.params.defaultFontSize);
    this.setFontStrokeSize(main.params.fontStrokeSize);
    this.setFont(TextTool.getFonts()[0].value);
    this.setFontStyle(TextTool.getFontStyles()[0].value);

    this.el.querySelector('.ptro-text-tool-apply').onclick = () => {
      this.apply();
    };

    this.el.querySelector('.ptro-text-tool-cancel').onclick = () => {
      this.close();
    };
  }

  getFont() {
    return this.font;
  }

  getFontStyle() {
    return this.fontStyle;
  }

  static getFonts() {
    const fonts = [
      '"Meiryo UI", "Helvetica Neue", Arial, sans-serif',
      '"MS Pゴシック", "MS PGothic", sans-serif',
      '"MS P明朝", "MS PMincho", serif',
      // 'Arial, Helvetica, sans-serif',
      // '"Arial Black", Gadget, sans-serif',
      // '"Comic Sans MS", cursive, sans-serif',
      // 'Impact, Charcoal, sans-serif',
      // '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
      // 'Tahoma, Geneva, sans-serif',
      // '"Trebuchet MS", Helvetica, sans-serif',
      // 'Verdana, Geneva, sans-serif',
      // '"Courier New", Courier, monospace',
      // '"Lucida Console", Monaco, monospace',
    ];

    const res = [];
    fonts.forEach((f) => {
      res.push({
        value: f,
        name: f.split(',')[0].replace(/"/g, ''),
        extraStyle: `font-family:${f}`,
        title: f.split(',')[0].replace(/"/g, ''),
      });
    });
    return res;
  }

  static getFontStyles() {
    return [
      {
        value: 'normal',
        name: 'ノーマル',
        title: 'Normal',
      },
      {
        value: 'bold',
        name: '太字',
        extraStyle: 'font-weight: bold',
        title: 'Bold',
      },
      {
        value: 'italic',
        name: 'イタリック',
        extraStyle: 'font-style: italic',
        title: 'Italic',
      },
      {
        value: 'italic bold',
        name: '太イタリック',
        extraStyle: 'font-weight: bold; font-style: italic',
        title: 'Bold + Italic',
      },
    ];
  }

  setFont(font) {
    this.font = font;
    this.input.style['font-family'] = font;
    if (this.active) {
      this.input.focus();
    }
    if (this.active) {
      this.reLimit();
    }
  }

  setFontStyle(style) {
    this.fontStyle = style;
    if (checkIn('bold', this.fontStyle)) {
      this.input.style['font-weight'] = 'bold';
    } else {
      this.input.style['font-weight'] = 'normal';
    }
    if (checkIn('italic', this.fontStyle)) {
      this.input.style['font-style'] = 'italic';
    } else {
      this.input.style['font-style'] = 'normal';
    }

    if (this.active) {
      this.input.focus();
    }
    if (this.active) {
      this.reLimit();
    }
  }

  setFontSize(size) {
    this.fontSize = size;
    this.input.style['font-size'] = `${size}px`;
    // if (this.active) {
    //   this.input.focus();
    // }
    if (this.active) {
      this.reLimit();
    }
  }

  setFontStrokeSize(size) {
    this.fontStrokeSize = size;
    this.input.style['-webkit-text-stroke'] = `${this.fontStrokeSize}px ${this.strokeColor}`;
    if (this.active) {
      this.input.focus();
    }
    if (this.active) {
      this.reLimit();
    }
  }

  setFontColor(color) {
    this.color = color;
    this.input.style.color = color;
    this.input.style['outline-color'] = color;
  }

  setStrokeColor(color) {
    this.strokeColor = color;
    this.input.style['-webkit-text-stroke'] = `${this.fontStrokeSize}px ${this.strokeColor}`;
  }

  inputLeft() {
    return this.input.documentOffsetLeft + this.main.scroller.scrollLeft;
  }

  inputTop() {
    return this.input.documentOffsetTop + this.main.scroller.scrollTop;
  }

  reLimit() {
    this.inputWrapper.style.right = 'auto';
    if (this.inputLeft() + this.input.clientWidth >
        this.main.elLeft() + this.el.clientWidth) {
      this.inputWrapper.style.right = '0';
    } else {
      this.inputWrapper.style.right = 'auto';
    }

    this.inputWrapper.style.bottom = 'auto';
    if (this.inputTop() + this.input.clientHeight >
        this.main.elTop() + this.el.clientHeight) {
      this.inputWrapper.style.bottom = '0';
    } else {
      this.inputWrapper.style.bottom = 'auto';
    }
  }

  handleMouseDown(event) {
    const mainClass = event.target.classList[0];
    if (mainClass === 'ptro-crp-el') {
      if (!this.active) {
        this.input.innerHTML = '<br>';
        this.pendingClear = true;
      }
      this.active = true;
      this.crd = [
        (event.clientX - this.main.elLeft()) + this.main.scroller.scrollLeft,
        (event.clientY - this.main.elTop()) + this.main.scroller.scrollTop,
      ];
      const scale = this.main.getScale();
      this.scaledCord = [this.crd[0] * scale, this.crd[1] * scale];
      this.inputWrapper.style.left = `${this.crd[0]}px`;
      this.inputWrapper.style.top = `${this.crd[1]}px`;
      this.inputWrapper.style.display = 'inline';
      this.input.focus();
      this.reLimit();
      this.input.onkeydown = (e) => {
        if (e.ctrlKey && e.keyCode === KEYS.enter) {
          this.apply();
          e.preventDefault();
        }
        if (e.keyCode === KEYS.esc) {
          this.close();
          this.main.closeActiveTool();
          e.preventDefault();
        }
        this.reLimit();
        if (this.pendingClear) {
          this.input.innerText = this.input.innerText.slice(1);
          this.pendingClear = false;
        }
        e.stopPropagation();
      };
      if (!this.main.isMobile) {
        event.preventDefault();
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  txt2canvas(text, options) {
    // console.warn(`txt2canvas: ${text} ${JSON.stringify(options)}`);
    const { scale, font, fontSize, fontStyle, fontColor } = options;
    const txcanvas = document.createElement('canvas');
    const txctx = txcanvas.getContext('2d');

    return new Promise((resolve) => {
      const lines = text.trim().split('\n');
      let maxWidth = 0;
      lines.forEach((element) => {
        txctx.scale(scale, scale);
        txctx.font = `${fontStyle} ${fontSize}px ${font}`;
        txctx.fillStyle = fontColor;
        const metrics = txctx.measureText(element);
        const width = metrics.width;
        if (width > maxWidth) {
          maxWidth = width;
        }
      });
      maxWidth *= 1.1;
      const h = parseInt(fontSize, 10);
      const fheight = h * lines.length;
      const height = fheight + (fheight * 0.7);
      txcanvas.width = Math.ceil(maxWidth * scale);
      txcanvas.height = Math.ceil(height * scale);
      txcanvas.style.width = `${maxWidth}px`;
      txcanvas.style.height = `${height}px`;
      // console.warn(txcanvas);
      // eslint-disable-next-line max-len
      // console.warn(`txt2canvas: canvas w:${txcanvas.width} x h:${txcanvas.height} style=w:${txcanvas.style.width} x h:${txcanvas.style.height}`);

      txctx.scale(scale, scale);
      let y = (h * 0.05);
      lines.forEach((element) => {
        txctx.font = `${fontStyle} ${fontSize}px ${font}`;
        txctx.fillStyle = fontColor;
        txctx.fillText(element, 0, y += (h * 1.05));
      });
      // console.warn('txt2canvas: done');
      // console.warn(txcanvas.toDataURL('image/png'));
      resolve(txcanvas);
    });
  }

  apply() {
    const origBorder = this.input.style.border;
    const scale = this.main.getScale();
    this.input.style.border = 'none';
    this.txt2canvas(this.input.innerText, {
      scale,
      font: this.font,
      fontSize: this.fontSize,
      fontStyle: this.fontStyle,
      fontColor: this.color,
    }).then((can) => {
      this.ctx.drawImage(can, this.scaledCord[0], this.scaledCord[1]);
      this.input.style.border = origBorder;
      this.close();
      this.main.worklog.captureState();
      this.main.closeActiveTool();
    });

    /*
    html2canvas(this.input, {
      backgroundColor: null,
      logging: false,
      scale: 1.0 * scale,
    }).then((can) => {
      console.warn('textinput: html2canvas done');
      this.ctx.drawImage(can, this.scaledCord[0], this.scaledCord[1]);
      this.input.style.border = origBorder;
      this.close();
      this.main.worklog.captureState();
      this.main.closeActiveTool();
    }).catch((error) => {
      console.warn('oops, something went wrong!', error);
    });
    */
  }

  close() {
    this.active = false;
    this.inputWrapper.style.display = 'none';
  }

  static code() {
    return '<span class="ptro-text-tool-input-wrapper">' +
      '<div contenteditable="true" class="ptro-text-tool-input"></div>' +
        '<span class="ptro-text-tool-buttons">' +
          `<button type="button" class="ptro-text-tool-apply ptro-icon-btn ptro-color-control" title="${tr('apply')}" 
                   style="margin: 2px">` +
            '<i class="ptro-icon ptro-icon-apply"></i>' +
          '</button>' +
          `<button type="button" class="ptro-text-tool-cancel ptro-icon-btn ptro-color-control" title="${tr('cancel')}"
                   style="margin: 2px">` +
            '<i class="ptro-icon ptro-icon-close"></i>' +
          '</button>' +
        '</span>' +
      '</span>';
  }
}
