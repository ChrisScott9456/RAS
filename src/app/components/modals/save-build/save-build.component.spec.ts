import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveBuildComponent } from './save-build.component';

describe('SaveBuildComponent', () => {
  let component: SaveBuildComponent;
  let fixture: ComponentFixture<SaveBuildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveBuildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveBuildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
