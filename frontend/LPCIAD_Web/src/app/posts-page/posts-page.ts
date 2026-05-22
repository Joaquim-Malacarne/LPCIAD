import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostsFeed } from '../posts-feed/posts-feed';

@Component({
  selector: 'app-posts-page',
  standalone: true,
  imports: [PostsFeed],
  templateUrl: './posts-page.html',
  styleUrls: ['./posts-page.css']
})
export class PostsPage implements OnInit {
  initialTag: string | null = null;

  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.initialTag = params.get('tag');
    });
  }
}
