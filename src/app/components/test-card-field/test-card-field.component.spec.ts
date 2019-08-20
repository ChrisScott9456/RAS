import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCardFieldComponent } from './test-card-field.component';

describe('TestCardFieldComponent', () => {
  let component: TestCardFieldComponent;
  let fixture: ComponentFixture<TestCardFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestCardFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestCardFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
