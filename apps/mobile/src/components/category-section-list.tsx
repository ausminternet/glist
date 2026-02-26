import {
  PlatformColor,
  SectionList,
  type SectionListProps,
  Text,
  View,
} from 'react-native'
import { ListEmptyComponent } from '@/components/list-empty-component'

export function CategorySectionList<
  T extends { categoryId: string | null; id: string },
>(
  props: SectionListProps<T, { title: string; data: T[]; categoryId: string }>,
) {
  const { sections, renderItem, ...rest } = props
  const renderSectionHeader = ({
    section,
  }: {
    section: { title: string; categoryId: string }
  }) => (
    <Text
      style={{
        fontSize: 21,
        paddingInline: 16,
        fontWeight: 'bold',
        color: PlatformColor('label'),
        marginBlockEnd: 8,
      }}
    >
      {section.title}
    </Text>
  )

  return (
    <SectionList
      style={{ flex: 1, paddingTop: 20 }}
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      renderSectionFooter={() => {
        return (
          <View
            style={{
              paddingBlockEnd: 36,
              marginInline: 16,
            }}
          />
        )
      }}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="scrollableAxes"
      automaticallyAdjustContentInsets={true}
      stickyHeaderHiddenOnScroll
      stickySectionHeadersEnabled={false}
      ListEmptyComponent={() => (
        <ListEmptyComponent
          title="Alles eingekauft"
          message="Tippe auf + um einen Eintrag hinzuzufügen"
        />
      )}
      {...rest}
    />
  )
}
