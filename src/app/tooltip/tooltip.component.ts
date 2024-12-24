@Component({
  selector: 'app-tooltip',
  template: `
    <div class="tooltip" [class.visible]="visible" [style.left.px]="x" [style.top.px]="y">
      <div class="tooltip-header">
        <img [src]="member?.photoUrl" alt="Profile">
        <div class="tooltip-info">
          <h3>{{ member?.name }}</h3>
          <span>{{ member?.birthDate | date:'mediumDate' }}</span>
        </div>
      </div>
      <div class="tooltip-actions">
        <button (click)="onAction('view')">
          <i class="fas fa-eye"></i> View Details
        </button>
        <button (click)="onAction('edit')">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button (click)="onAction('add')">
          <i class="fas fa-plus"></i> Add Relative
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent {
  @Input() member: FamilyMember | null = null;
  @Input() visible = false;
  @Input() x = 0;
  @Input() y = 0;
  @Output() action = new EventEmitter<{type: string, member: FamilyMember}>();

  onAction(type: string): void {
    if (this.member) {
      this.action.emit({ type, member: this.member });
    }
  }
} 