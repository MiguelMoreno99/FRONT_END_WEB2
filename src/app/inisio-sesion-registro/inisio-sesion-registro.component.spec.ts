import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InisioSesionRegistroComponent } from './inisio-sesion-registro.component';

describe('InisioSesionRegistroComponent', () => {
  let component: InisioSesionRegistroComponent;
  let fixture: ComponentFixture<InisioSesionRegistroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InisioSesionRegistroComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InisioSesionRegistroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
