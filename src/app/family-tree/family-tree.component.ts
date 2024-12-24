import { Component, ElementRef, Input, AfterViewInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';

export interface FamilyMember {
  id: string;
  name: string;
  photoUrl: string;
  birthDate: string;
  gender: 'male' | 'female';
  about?: string;
  occupation?: string;
  location?: string;
  spouse?: Spouse;
  photos?: string[];
  email?: string;
  phone?: string;
  children?: FamilyMember[];
}

interface Spouse {
  name: string;
  photoUrl?: string;
  birthDate?: string;
  marriageDate?: string;
}

@Component({
  selector: 'app-family-tree',
  templateUrl: './family-tree.component.html',
  styleUrls: ['./family-tree.component.scss']
})
export class FamilyTreeComponent implements AfterViewInit {
  @ViewChild('treeContainer') private treeContainer!: ElementRef;
  @Input() data!: FamilyMember;

  private svg: any;
  private tree: any;
  private root: any;
  private zoom: any;

  private margin = { top: 20, right: 90, bottom: 30, left: 90 };
  private width = 800;
  private height = 600;

  selectedMember: FamilyMember | null = null;
  isDrawerOpen = false;

  private currentZoom = 1;
  currentPhotoIndex = 0;

  private colorScheme = [
    '#8B4513',  // Brown for root
    '#FF6B6B',  // Coral
    '#4ECDC4',  // Turquoise
    '#45B7D1',  // Light Blue
    '#96CEB4',  // Sage Green
    '#FFEEAD',  // Light Yellow
  ];

  get hasMultiplePhotos(): boolean {
    return (this.selectedMember?.photos?.length ?? 0) > 1;
  }

  get currentPhoto(): string {
    if (!this.selectedMember) return '';
    
    if (this.selectedMember.photos && this.selectedMember.photos.length > 0) {
      return this.selectedMember.photos[this.currentPhotoIndex];
    }
    
    return this.selectedMember.photoUrl || '';
  }

  ngAfterViewInit() {
    this.initializeTree();
  }

  private initializeTree(): void {
    // Clear existing SVG
    d3.select(this.treeContainer.nativeElement).select('svg').remove();

    // Create new SVG
    this.svg = d3.select(this.treeContainer.nativeElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`);

    // Add zoom behavior
    this.zoom = d3.zoom()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        this.svg.select('g')
          .attr('transform', event.transform);
      });

    this.svg.call(this.zoom);

    const g = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.tree = d3.tree()
      .nodeSize([120, 200]);

    // Initialize the root
    this.root = d3.hierarchy(this.data);
    this.root.x0 = 0;
    this.root.y0 = 0;

    this.update(this.root);
  }

  private update(source: any): void {
    const duration = 750;

    // Compute the new tree layout
    const treeData = this.tree(this.root);
    const nodes = treeData.descendants();
    const links = treeData.descendants().slice(1);

    // Normalize for fixed-depth (swap x and y for vertical layout)
    nodes.forEach((d: any) => { 
      const oldX = d.x;
      d.x = d.y;
      d.y = oldX;
    });

    // Update the nodes
    const node = this.svg.select('g')
      .selectAll('g.node')
      .data(nodes, (d: any) => d.id || (d.id = ++this.i));

    // Enter new nodes
    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', (d: any) => `translate(${source.x0},${source.y0})`)
      .on('click', (event: any, d: any) => this.click(d))
      .on('dblclick', (event: any, d: any) => this.showDetails(d.data));

    // Add outer circle (colored border)
    nodeEnter.append('circle')
      .attr('class', 'node-border')
      .attr('r', 35)
      .style('fill', (d: any) => this.getNodeColor(d))
      .style('stroke', 'white')
      .style('stroke-width', '3px');

    // Add white background circle
    nodeEnter.append('circle')
      .attr('class', 'node-background')
      .attr('r', 32)
      .style('fill', 'white');

    // Add images with circular clip path
    nodeEnter.append('clipPath')
      .attr('id', (d: any) => `clip-${d.data.id}`)
      .append('circle')
      .attr('r', 30);

    nodeEnter.append('image')
      .attr('xlink:href', (d: any) => d.data.photoUrl || 'assets/default-avatar.png')
      .attr('x', -30)
      .attr('y', -30)
      .attr('width', 60)
      .attr('height', 60)
      .attr('clip-path', (d: any) => `url(#clip-${d.data.id})`);

    // Add text label
    nodeEnter.append('text')
      .attr('dy', '50px')
      .attr('x', 0)
      .attr('text-anchor', 'middle')
      .text((d: any) => d.data.name)
      .style('font-size', '12px')
      .style('font-weight', '500');

    // Update the node attributes and style
    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate.transition()
      .duration(duration)
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    nodeUpdate.select('circle.node')
      .attr('r', 10)
      .style('fill', (d: any) => d._children ? 'lightsteelblue' : '#fff')
      .attr('cursor', 'pointer');

    // Remove any exiting nodes
    const nodeExit = node.exit().transition()
      .duration(duration)
      .attr('transform', (d: any) => `translate(${source.y},${source.x})`)
      .remove();

    nodeExit.select('circle')
      .attr('r', 1e-6);

    nodeExit.select('text')
      .style('fill-opacity', 1e-6);

    // Update the links
    const link = this.svg.select('g').selectAll('path.link')
      .data(links, (d: any) => d.id);

    // Enter any new links
    const linkEnter = link.enter().insert('path', 'g')
      .attr('class', 'link')
      .attr('d', (d: any) => {
        const o = { x: source.x0, y: source.y0 };
        return this.diagonal(o, o);
      });

    // Update the links
    link.merge(linkEnter).transition()
      .duration(duration)
      .attr('d', (d: any) => this.diagonal(d, d.parent));

    // Remove any exiting links
    link.exit().transition()
      .duration(duration)
      .attr('d', (d: any) => {
        const o = { x: source.x, y: source.y };
        return this.diagonal(o, o);
      })
      .remove();

    // Store the old positions for transition
    nodes.forEach((d: any) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  private diagonal(s: any, d: any): string {
    return `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`;
  }

  private click(d: any): void {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    this.update(d);
  }

  private showDetails(member: FamilyMember): void {
    this.selectedMember = member;
    this.isDrawerOpen = true;
  }

  closeDrawer(): void {
    this.isDrawerOpen = false;
  }

  private i = 0; // Counter for generating unique IDs

  zoomIn(): void {
    this.currentZoom = Math.min(this.currentZoom * 1.2, 3);
    this.zoom.scaleTo(this.svg, this.currentZoom);
  }

  zoomOut(): void {
    this.currentZoom = Math.max(this.currentZoom * 0.8, 0.1);
    this.zoom.scaleTo(this.svg, this.currentZoom);
  }

  resetZoom(): void {
    this.currentZoom = 1;
    this.zoom.transform(this.svg, d3.zoomIdentity);
  }

  expandAll(): void {
    this.expand(this.root);
    this.update(this.root);
  }

  collapseAll(): void {
    this.collapse(this.root);
    this.update(this.root);
  }

  private expand(d: any): void {
    if (d._children) {
      d.children = d._children;
      d._children = null;
      d.children.forEach((child: any) => this.expand(child));
    }
  }

  private collapse(d: any): void {
    if (d.children) {
      d._children = d.children;
      d._children.forEach((child: any) => this.collapse(child));
      d.children = null;
    }
  }

  centerTree(): void {
    const bounds = this.svg.node().getBBox();
    const fullWidth = this.width;
    const fullHeight = this.height;
    const width = bounds.width;
    const height = bounds.height;
    const midX = bounds.x + width / 2;
    const midY = bounds.y + height / 2;

    this.svg.transition()
      .duration(750)
      .call(
        this.zoom.transform,
        d3.zoomIdentity
          .translate(fullWidth / 2 - midX, fullHeight / 2 - midY)
          .scale(Math.min(0.9, 0.9 / Math.max(width / fullWidth, height / fullHeight)))
      );
  }

  downloadImage(): void {
    const svgData = new XMLSerializer().serializeToString(this.svg.node());
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = this.width;
      canvas.height = this.height;
      
      if (ctx) {  // Check if context exists
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        const link = document.createElement('a');
        link.download = 'family-tree.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  }

  toggleDrawer(): void {
    this.isDrawerOpen = !this.isDrawerOpen;
  }

  private getNodeColor(d: any): string {
    return this.colorScheme[d.depth % this.colorScheme.length];
  }

  nextPhoto(): void {
    if (this.selectedMember?.photos && this.selectedMember.photos.length > 1) {
      this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.selectedMember.photos.length;
    }
  }

  prevPhoto(): void {
    if (this.selectedMember?.photos && this.selectedMember.photos.length > 1) {
      this.currentPhotoIndex = this.currentPhotoIndex === 0 
        ? this.selectedMember.photos.length - 1 
        : this.currentPhotoIndex - 1;
    }
  }

  selectPhoto(index: number): void {
    if (this.selectedMember?.photos && index < this.selectedMember.photos.length) {
      this.currentPhotoIndex = index;
    }
  }

  calculateAge(birthDate: string): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  handleTooltipAction(event: {type: string, member: FamilyMember}): void {
    switch (event.type) {
      case 'view':
        this.showDetails(event.member);
        break;
      case 'edit':
        // Implement edit functionality
        break;
      case 'add':
        // Implement add relative functionality
        break;
    }
  }
}