import { Box, Button, Stack } from '@mui/material'
import BaseAppBar from '../components/BaseAppBar'
import { useSettingsStore } from '../stores/settings'
import { shallow } from '../stores'

import { Formik, Form, Field } from 'formik'
import { TextField } from 'formik-mui'
import { useSnackbar } from 'notistack'

export function SettingsPage() {
  const [apiClient, setOpenaiProfile] = useSettingsStore(
    (s) => [s.apiClient, s.setOpenaiProfile],
    shallow
  )

  const { enqueueSnackbar } = useSnackbar()

  return (
    <Box>
      <BaseAppBar title="Settings" />
      <Box sx={{ mt: '100px', display: 'flex', flexDirection: 'column' }}>
        <Formik
          initialValues={{
            openai_endpoint: apiClient.usedOpenaiProfile.endpoint,
            openai_apikey: apiClient.usedOpenaiProfile.apiKey,
          }}
          onSubmit={(data, { setSubmitting }) => {
            setOpenaiProfile({
              ...apiClient.usedOpenaiProfile,
              endpoint: data.openai_endpoint,
              apiKey: data.openai_apikey,
            })
            setSubmitting(false)

            enqueueSnackbar('Settings saved', {
              variant: 'success',
              autoHideDuration: 1000,
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'center',
              },
            })
          }}
        >
          {({ submitForm, resetForm, isSubmitting }) => (
            <Form>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <Field
                  component={TextField}
                  name="openai_endpoint"
                  label="OpenAI API Endpoint"
                />
                <Field
                  component={TextField}
                  name="openai_apikey"
                  label="OpenAI API Key"
                  type="password"
                />
                <Stack direction="row" gap={4} justifyContent="center">
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    Save
                  </Button>
                  <Button type="reset" variant="outlined">
                    Reset
                  </Button>
                </Stack>
              </Box>
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  )
}
