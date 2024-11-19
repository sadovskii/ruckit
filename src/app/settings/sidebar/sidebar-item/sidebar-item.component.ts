import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-sidebar-item',
  templateUrl: './sidebar-item.component.html',
  styleUrls: ['./sidebar-item.component.scss']
})
export class SidebarItemComponent implements OnInit {
  @Input()
  public content: string;

  @Input()
  public icon: string;

  @Input()
  public iconLinear: string;

  @Input()
  public iconSolid: string;

  @Input()
  public active: boolean;

  @Input()
  public disable: boolean;

  ngOnInit(): void {
    console.log("content = ", this.content);
  }
}
