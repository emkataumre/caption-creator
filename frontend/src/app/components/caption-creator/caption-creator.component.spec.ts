import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptionCreatorComponent } from './caption-creator.component';

describe('CaptionCreatorComponent', () => {
  let component: CaptionCreatorComponent;
  let fixture: ComponentFixture<CaptionCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CaptionCreatorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaptionCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
