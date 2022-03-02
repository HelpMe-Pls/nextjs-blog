import { NextApiResponse } from 'next'

// get rid of the preview cookie
export default function handler(_req, res: NextApiResponse) {
    res.clearPreviewData()
    res.end('preview mode disabled')
}