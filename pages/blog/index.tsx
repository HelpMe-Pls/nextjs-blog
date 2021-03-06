// NextJS's magic separates server-side and client-side code at build/run time so that's why we can import/use server-ish code in the same file with client-side code

import { Pane, majorScale } from 'evergreen-ui'
import matter from 'gray-matter'
import path from 'path'
import fs from 'fs'
import orderby from 'lodash.orderby'
import Container from '../../components/container'
import HomeNav from '../../components/homeNav'
import PostPreview from '../../components/postPreview'
import { posts as postsFromCMS } from '../../content'

const Blog = ({ posts }) => {
	return (
		<Pane>
			<header>
				<HomeNav />
			</header>
			<main>
				<Container>
					{posts.map((post) => (
						<Pane key={post.title} marginY={majorScale(5)}>
							<PostPreview post={post} />
						</Pane>
					))}
				</Container>
			</main>
		</Pane>
	)
}

Blog.defaultProps = {
	posts: [],
}

export async function getStaticProps() {
	// read the posts dir from the filesystem (fs - in this case: '../../post')
	const postsDirectory = path.join(process.cwd(), 'posts')
	const filenames = fs.readdirSync(postsDirectory)

	// get each post from the fs
	const filePosts = filenames.map((filename) => {
		const filePath = path.join(postsDirectory, filename)
		return fs.readFileSync(filePath, 'utf8')
	})

	// merge our posts from our CMS and fs then sort by publish date
	const posts = orderby(
		[...postsFromCMS.published, ...filePosts].map((content) => {
			// extract frontmatter from markdown content
			const { data } = matter(content)
			return data
		}),
		['publishedOn'],
		['desc']
	)

	return { props: { posts } }
}

export default Blog

/**
 * Need to get the posts from the
 * fs and our CMS
 */
