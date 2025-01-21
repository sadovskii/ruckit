import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar-header',
  templateUrl: './sidebar-header.component.html',
  styleUrls: ['./sidebar-header.component.scss']
})
export class SidebarHeaderComponent implements OnInit {

  @Input()
  public clickable: boolean = false;

  @Output()
  public headerClick = new EventEmitter();

  ngOnInit(): void {
    console.log('clickable = ', this.clickable);
  }

  onClick() {
    console.log('clickable after click = ', this.clickable);
    this.headerClick.emit();
  }
}
