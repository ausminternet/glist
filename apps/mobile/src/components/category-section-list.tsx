import {
  PlatformColor,
  SectionList,
  type SectionListProps,
  Text,
  View,
} from 'react-native'

type CategorySectionListProps<T> = SectionListProps<
  T,
  { title: string; data: T[]; categoryId: string }
> & {
  ListEmptyItem: React.ComponentType
}

export function CategorySectionList<
  T extends { categoryId: string | null; id: string },
>(props: CategorySectionListProps<T>) {
  const { sections, renderItem, ListEmptyItem, ...rest } = props
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
      ListEmptyComponent={ListEmptyItem}
      {...rest}
    />
  )
}
