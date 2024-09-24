import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import Quill from 'quill';
import BlotFormatter, {
  AlignAction,
  DeleteAction,
  ImageSpec,
} from 'quill-blot-formatter';

@Component({
  selector: 'app-quill-editor',
  standalone: true,
  imports: [],
  templateUrl: './quill-editor.component.html',
  styleUrl: './quill-editor.component.scss',
})
export class QuillEditorComponent implements AfterViewInit {
  private quill!: Quill;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      await this.loadQuill();
    }
  }

  private async loadQuill(): Promise<void> {
    try {
      const Quill = (await import('quill')).default;
      const BlotFormatter = await import('quill-blot-formatter');
      Quill.register('modules/blotFormatter', BlotFormatter.default);
      const toolbarOptions = {
        container: [
          [{ font: [] }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ size: ['small', true, 'large', 'huge'] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ color: [] }, { background: [] }],
          [
            { list: 'ordered' },
            { list: 'bullet' },
            { indent: '-1' },
            { indent: '+1' },
          ],
          [{ direction: 'rtl' }, { align: [] }],
          [{ header: 1 }, { header: 2 }, 'blockquote', 'code-block'],
          [{ script: 'sub' }, { script: 'super' }],

          ['link', 'image', 'video', 'formula', 'clean'],
        ],
      };
      this.quill = new Quill('#editor', {
        modules: {
          blotFormatter: {},
          toolbar: toolbarOptions,
          history: {
            delay: 1000,
            maxStack: 500,
            userOnly: true,
          },
        },

        placeholder: 'just type here...',
        theme: 'snow',
      });
      this.quill.on('text-change', (delta, oldDelta, source) => {
        
        if (source == 'api') {
          console.log('An API call triggered this change.');
        } else if (source == 'user') {
          console.log(delta);
        }
      });
      this.quill.on('selection-change', (range, oldRange, source) => {
        if (range) {
          if (range.length == 0) {
            console.log('User cursor is on', range.index);
          } else {
            const text = this.quill.getText(range.index, range.length);
            console.log('User has highlighted', text);
          }
        } else {
          console.log('Cursor not in the editor');
        }
      });
    } catch (error) {
      console.error('Error loading Quill:', error);
    }
  }
}
