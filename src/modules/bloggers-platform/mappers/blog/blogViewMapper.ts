import { BlogViewType } from '../../api/view-types/blogs/blogView.type';
import { Blog } from '../../domain/entities/blogs.entity';

export const blogViewMapper = (blog: Blog): BlogViewType => {
  return {
    id: blog.id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt.toISOString(),
    isMembership: blog.isMembership,
  };
};
