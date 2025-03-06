import { ProcessedArticle } from '@/lib/utils'

export const SliderContent = ({
  processedArticle
}: {
  processedArticle: ProcessedArticle
}) => {
  // Check if processedArticle and its properties exist before rendering
  console.log(processedArticle)
  if (!processedArticle) {
    return null // Return null or a loading state if processedArticle is not available yet
  }

  return (
    <div className='rounded-lg bg-white p-5 text-gray-900 shadow-md dark:bg-gray-900 dark:text-gray-100'>
      <div>
        <h3 className='py-5 text-3xl font-bold'>Summary</h3>
        <p>{processedArticle.summary || 'No summary available'}</p>
      </div>
      <div>
        <h3 className='py-5 text-3xl font-bold'>Key Takeaways</h3>
        {Array.isArray(processedArticle.keyTakeaways) ? (
          <ul className='list-disc pl-5'>
            {processedArticle.keyTakeaways.map((keyTakeaway, index) => (
              <li key={index}>{keyTakeaway}</li>
            ))}
          </ul>
        ) : (
          <p>No key takeaways available</p>
        )}
      </div>
    </div>
  )
}
