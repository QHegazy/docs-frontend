import { TestBed } from '@angular/core/testing';

import { DocServiceCommunication } from './doc-service.service';

describe('DocServiceService', () => {
  let service: DocServiceCommunication;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocServiceCommunication);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
