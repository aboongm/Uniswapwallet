import { NativeStackScreenProps } from '@react-navigation/native-stack'
import dayjs from 'dayjs'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native-gesture-handler'
import { useAppDispatch, useAppTheme } from 'src/app/hooks'
import { OnboardingStackParamList } from 'src/app/navigation/types'
import { TouchableArea } from 'src/components/buttons/TouchableArea'
import { Chevron } from 'src/components/icons/Chevron'
import { Flex } from 'src/components/layout'
import { Text } from 'src/components/Text'
import { Unicon } from 'src/components/unicons/Unicon'
import { IS_ANDROID } from 'src/constants/globals'
import { useCloudBackups } from 'src/features/CloudBackup/hooks'
import { CloudStorageMnemonicBackup } from 'src/features/CloudBackup/types'
import { OnboardingScreen } from 'src/features/onboarding/OnboardingScreen'
import { OnboardingScreens } from 'src/screens/Screens'
import { useAddBackButton } from 'src/utils/useAddBackButton'
import {
  PendingAccountActions,
  pendingAccountActions,
} from 'wallet/src/features/wallet/create/pendingAccountsSaga'
import { shortenAddress } from 'wallet/src/utils/addresses'

type Props = NativeStackScreenProps<OnboardingStackParamList, OnboardingScreens.RestoreCloudBackup>

export function RestoreCloudBackupScreen({ navigation, route: { params } }: Props): JSX.Element {
  const { t } = useTranslation()
  const theme = useAppTheme()
  const dispatch = useAppDispatch()
  const backups = useCloudBackups()
  const sortedBackups = backups.slice().sort((a, b) => b.createdAt - a.createdAt)

  const onPressRestoreBackup = async (backup: CloudStorageMnemonicBackup): Promise<void> => {
    // Clear any existing pending accounts
    dispatch(pendingAccountActions.trigger(PendingAccountActions.Delete))

    navigation.navigate({
      name: OnboardingScreens.RestoreCloudBackupPassword,
      params: { ...params, mnemonicId: backup.mnemonicId },
      merge: true,
    })
  }

  useAddBackButton(navigation)

  return (
    <OnboardingScreen
      subtitle={
        IS_ANDROID
          ? t('There are multiple recovery phrases backed up to your Google Drive.')
          : t('There are multiple recovery phrases backed up to your iCloud.')
      }
      title={t('Select backup to restore')}>
      <ScrollView>
        <Flex gap="spacing8">
          {sortedBackups.map((backup, index) => {
            const { mnemonicId, createdAt } = backup
            return (
              <TouchableArea
                key={backup.mnemonicId}
                backgroundColor="surface2"
                borderColor="surface2"
                borderRadius="rounded16"
                borderWidth={1}
                p="spacing16"
                onPress={(): Promise<void> => onPressRestoreBackup(backup)}>
                <Flex row alignItems="center" justifyContent="space-between">
                  <Flex centered row gap="spacing12">
                    <Unicon address={mnemonicId} size={32} />
                    <Flex gap="none">
                      <Text numberOfLines={1} variant="subheadSmall">
                        {t('Backup {{backupIndex}}', { backupIndex: sortedBackups.length - index })}
                      </Text>
                      <Text color="neutral2" variant="buttonLabelMicro">
                        {shortenAddress(mnemonicId)}
                      </Text>
                    </Flex>
                  </Flex>
                  <Flex row gap="spacing12">
                    <Flex alignItems="flex-end" gap="spacing4">
                      <Text color="neutral2" variant="buttonLabelMicro">
                        {t('Backed up on:')}
                      </Text>
                      <Text variant="buttonLabelMicro">
                        {dayjs.unix(createdAt).format('MMM D, YYYY, h:mma')}
                      </Text>
                    </Flex>
                    <Chevron color={theme.colors.neutral1} direction="e" />
                  </Flex>
                </Flex>
              </TouchableArea>
            )
          })}
        </Flex>
      </ScrollView>
    </OnboardingScreen>
  )
}
