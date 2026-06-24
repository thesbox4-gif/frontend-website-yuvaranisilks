import { homepageService } from '@/services/homepageService'
import { HomepageSections } from '@/components/shop/HomepageSections'

/** Server component: fetches homepage settings then passes to the client renderer. */
export async function HomepageSectionsLoader() {
  const settings = await homepageService.getSettings()
  if (!settings.sections.length) return null
  return <HomepageSections sections={settings.sections} />
}
