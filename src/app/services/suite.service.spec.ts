import { TestBed } from '@angular/core/testing';

import { SuiteService } from './suite.service';

describe('SuiteService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SuiteService = TestBed.get(SuiteService);
    expect(service).toBeTruthy();
  });
});
