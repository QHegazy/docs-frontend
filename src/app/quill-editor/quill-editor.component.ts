import {
  Component,
  Inject,
  PLATFORM_ID,
  AfterViewInit,
  ViewEncapsulation,
  inject,
  OnInit,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Quill from 'quill';
import { DocServiceService } from '../../serivces/docService/doc-service.service';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-quill-editor',
  standalone: true,
  imports: [],
  templateUrl: './quill-editor.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrl: './quill-editor.component.scss',
})
export class QuillEditorComponent implements AfterViewInit, OnInit {
  private quill!: Quill;
  id!: string;
  doc_service = inject(DocServiceService);
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
  }

  async ngAfterViewInit(): Promise<void> {
    this.doc_service.joinroom(this.id);
    // const messages = this.doc_service.getMessage();
    // messages.subscribe((message: any) => {
    //   this.quill.setContents(message);
    //   console.log(message);
    // });

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
          console.log(this.quill.getContents());
          this.doc_service.sendtoroom(
            this.id,
            JSON.stringify(this.quill.getContents())
          );
        }
      });
    } catch (error) {
      console.error('Error loading Quill:', error);
    }
  }
}
